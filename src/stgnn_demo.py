from __future__ import annotations

import argparse
import json
import math
import random
from dataclasses import asdict, dataclass
from pathlib import Path

import numpy as np
import torch
from torch import nn
from torch.nn import functional as F


@dataclass
class Farm:
    farm_id: str
    x: float
    y: float
    livestock_type: int
    density: float
    biosecurity: float
    vehicle_contact: float
    wind_exposure: float


def set_seed(seed: int) -> None:
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)


def create_virtual_farms(count: int = 48, seed: int = 42) -> list[Farm]:
    rng = np.random.default_rng(seed)
    centers = np.array([[0.2, 0.25], [0.52, 0.68], [0.78, 0.28], [0.7, 0.76]])
    farms: list[Farm] = []
    for idx in range(count):
        center = centers[idx % len(centers)]
        pos = np.clip(center + rng.normal(0, 0.085, size=2), 0.05, 0.95)
        farms.append(
            Farm(
                farm_id=f"F-{idx + 1:03d}",
                x=float(pos[0]),
                y=float(pos[1]),
                livestock_type=int(rng.integers(0, 4)),
                density=float(rng.uniform(0.25, 1.0)),
                biosecurity=float(rng.uniform(0.2, 0.95)),
                vehicle_contact=float(rng.uniform(0.0, 1.0)),
                wind_exposure=float(rng.uniform(0.0, 1.0)),
            )
        )
    return farms


def build_graph(farms: list[Farm]) -> torch.Tensor:
    coords = torch.tensor([[f.x, f.y] for f in farms], dtype=torch.float32)
    dist = torch.cdist(coords, coords)
    livestock = torch.tensor([f.livestock_type for f in farms])
    same_type = (livestock[:, None] == livestock[None, :]).float()
    vehicle = torch.tensor([f.vehicle_contact for f in farms], dtype=torch.float32)
    vehicle_link = (vehicle[:, None] + vehicle[None, :]) / 2

    adjacency = torch.exp(-dist * 8.0) + same_type * 0.08 + vehicle_link * 0.1
    adjacency.fill_diagonal_(1.0)
    adjacency = adjacency / adjacency.sum(dim=1, keepdim=True).clamp_min(1e-6)
    return adjacency


def node_features(farms: list[Farm]) -> torch.Tensor:
    livestock = F.one_hot(torch.tensor([f.livestock_type for f in farms]), num_classes=4).float()
    numeric = torch.tensor(
        [[f.x, f.y, f.density, f.biosecurity, f.vehicle_contact, f.wind_exposure] for f in farms],
        dtype=torch.float32,
    )
    return torch.cat([numeric, livestock], dim=1)


def simulate_outbreaks(
    farms: list[Farm],
    adjacency: torch.Tensor,
    scenarios: int = 220,
    horizon: int = 12,
    seed: int = 42,
) -> tuple[torch.Tensor, torch.Tensor]:
    rng = np.random.default_rng(seed)
    static = node_features(farms)
    n_nodes = len(farms)
    x = torch.zeros((scenarios, horizon, n_nodes, static.shape[1] + 2), dtype=torch.float32)
    y = torch.zeros((scenarios, horizon, n_nodes, 1), dtype=torch.float32)

    density = static[:, 2]
    biosecurity = static[:, 3]
    vehicle = static[:, 4]
    wind = static[:, 5]
    susceptibility = (0.38 + density * 0.38 + vehicle * 0.18 + wind * 0.15 - biosecurity * 0.28).clamp(0.05, 1.25)

    for scenario_idx in range(scenarios):
        source = int(rng.integers(0, n_nodes))
        risk = torch.zeros(n_nodes)
        infected = torch.zeros(n_nodes)
        risk[source] = 1.0
        infected[source] = 1.0
        infectivity = float(rng.uniform(0.75, 1.55))
        quarantine = float(rng.uniform(0.05, 0.55))

        for day in range(horizon):
            day_signal = torch.full((n_nodes, 1), day / max(1, horizon - 1))
            scenario_signal = torch.full((n_nodes, 1), infectivity - quarantine)
            x[scenario_idx, day] = torch.cat([static, day_signal, scenario_signal], dim=1)

            pressure = adjacency.T @ risk
            next_risk = (pressure * susceptibility * infectivity * (1 - quarantine * 0.55)).clamp(0, 1)
            next_risk = torch.maximum(next_risk, risk * 0.82)
            infection_prob = torch.sigmoid((next_risk - 0.58) * 7.5)
            newly_infected = (torch.rand(n_nodes) < infection_prob * 0.45).float()
            infected = torch.maximum(infected, newly_infected)
            risk = torch.maximum(next_risk, infected)
            y[scenario_idx, day, :, 0] = risk

    return x, y


class DistanceBaseline:
    def __init__(self, adjacency: torch.Tensor) -> None:
        self.adjacency = adjacency

    def predict(self, x: torch.Tensor) -> torch.Tensor:
        # Baseline 역할: 기존 작업물이 단순 거리 그래프 전파였다고 가정한 비교 대상입니다.
        scenario_strength = x[..., -1:].clamp(0.2, 1.5)
        source_signal = (x[..., 2:3] * 0.2 + x[..., 4:5] * 0.35 + x[..., 5:6] * 0.2) * scenario_strength
        propagated = torch.einsum("ij,btjf->btif", self.adjacency, source_signal)
        return propagated.clamp(0, 1)


class GraphConv(nn.Module):
    def __init__(self, in_dim: int, out_dim: int) -> None:
        super().__init__()
        self.linear_self = nn.Linear(in_dim, out_dim)
        self.linear_neigh = nn.Linear(in_dim, out_dim)

    def forward(self, x: torch.Tensor, adjacency: torch.Tensor) -> torch.Tensor:
        neigh = torch.einsum("ij,btjf->btif", adjacency, x)
        return F.relu(self.linear_self(x) + self.linear_neigh(neigh))


class ImprovedSTGNN(nn.Module):
    def __init__(self, in_dim: int, hidden_dim: int = 48) -> None:
        super().__init__()
        self.gcn1 = GraphConv(in_dim, hidden_dim)
        self.gcn2 = GraphConv(hidden_dim, hidden_dim)
        self.temporal = nn.GRU(hidden_dim, hidden_dim, batch_first=True)
        self.head = nn.Sequential(nn.Linear(hidden_dim, hidden_dim // 2), nn.ReLU(), nn.Linear(hidden_dim // 2, 1))

    def forward(self, x: torch.Tensor, adjacency: torch.Tensor) -> torch.Tensor:
        z = self.gcn1(x, adjacency)
        z = self.gcn2(z, adjacency)
        batch, steps, nodes, hidden = z.shape
        z = z.permute(0, 2, 1, 3).reshape(batch * nodes, steps, hidden)
        z, _ = self.temporal(z)
        logits = self.head(z)
        logits = logits.reshape(batch, nodes, steps, 1).permute(0, 2, 1, 3)
        return torch.sigmoid(logits)


def regression_metrics(pred: torch.Tensor, target: torch.Tensor, priority_threshold: float = 0.25) -> dict[str, float]:
    mae = torch.mean(torch.abs(pred - target)).item()
    rmse = torch.sqrt(torch.mean((pred - target) ** 2)).item()
    priority_target = target >= priority_threshold
    priority_pred = pred >= priority_threshold
    tp = (priority_target & priority_pred).sum().item()
    fp = (~priority_target & priority_pred).sum().item()
    fn = (priority_target & ~priority_pred).sum().item()
    precision = tp / max(1, tp + fp)
    recall = tp / max(1, tp + fn)
    return {
        "mae": mae,
        "rmse": rmse,
        "priority_threshold": priority_threshold,
        "priority_precision": precision,
        "priority_recall": recall,
    }


def train_model(model: ImprovedSTGNN, adjacency: torch.Tensor, train_x: torch.Tensor, train_y: torch.Tensor, epochs: int) -> None:
    optimizer = torch.optim.AdamW(model.parameters(), lr=0.004, weight_decay=0.0005)
    for _ in range(epochs):
        model.train()
        optimizer.zero_grad()
        pred = model(train_x, adjacency)
        loss = F.mse_loss(pred, train_y)
        loss.backward()
        optimizer.step()


def export_payload(farms: list[Farm], pred: torch.Tensor, out_path: Path) -> None:
    final_risk = pred[0, -1, :, 0].detach().cpu()
    ranked = torch.argsort(final_risk, descending=True)[:12]
    payload = {
        "model": "improved_pytorch_stgnn",
        "description": "GraphConv + GRU temporal encoder biosecurity priority output",
        "risk_map": [
            {
                **asdict(farms[int(idx)]),
                "risk_score": round(float(final_risk[int(idx)]), 4),
                "risk_level": "high" if final_risk[int(idx)] >= 0.65 else "watch" if final_risk[int(idx)] >= 0.35 else "low",
            }
            for idx in ranked
        ],
    }
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--epochs", type=int, default=60)
    parser.add_argument("--out", type=Path, default=Path("outputs/stgnn_risk_payload.json"))
    args = parser.parse_args()

    set_seed(42)
    farms = create_virtual_farms()
    adjacency = build_graph(farms)
    x, y = simulate_outbreaks(farms, adjacency)

    split = math.floor(x.shape[0] * 0.75)
    train_x, test_x = x[:split], x[split:]
    train_y, test_y = y[:split], y[split:]

    baseline = DistanceBaseline(adjacency)
    baseline_pred = baseline.predict(test_x)
    baseline_metrics = regression_metrics(baseline_pred, test_y)

    model = ImprovedSTGNN(in_dim=x.shape[-1])
    train_model(model, adjacency, train_x, train_y, epochs=args.epochs)
    model.eval()
    with torch.no_grad():
      improved_pred = model(test_x, adjacency)
    improved_metrics = regression_metrics(improved_pred, test_y)
    export_payload(farms, improved_pred[:1], args.out)

    report = {
        "baseline_distance_graph": baseline_metrics,
        "improved_pytorch_stgnn": improved_metrics,
        "output_file": str(args.out),
    }
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
