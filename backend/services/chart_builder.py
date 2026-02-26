import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from typing import List
from models.schemas import ChartData

COLORS = px.colors.qualitative.Set2
BLUE = "#4F81BD"
ORANGE = "#F79646"


def build_all_charts(df: pd.DataFrame) -> List[ChartData]:
    builders = [
        ("sales_profit_trend", "Sales & Profit Trend", _sales_profit_trend),
        ("sales_by_category", "Sales by Category", _sales_by_category),
        ("sales_by_subcategory", "Sales by Sub-Category", _sales_by_subcategory),
        ("sales_by_market_region", "Sales by Market & Region", _sales_by_market_region),
        ("segment_breakdown", "Sales by Customer Segment", _segment_breakdown),
        ("top_products", "Top 10 Products by Profit", _top_products),
        ("discount_vs_profit", "Discount vs Profit", _discount_vs_profit),
        ("ship_mode_priority", "Ship Mode & Order Priority", _ship_mode_priority),
    ]

    charts = []
    for chart_id, title, builder in builders:
        try:
            fig = builder(df)
            _apply_base_layout(fig)
            charts.append(ChartData(
                chart_id=chart_id,
                title=title,
                figure_json=fig.to_json(),
            ))
        except Exception as e:
            print(f"[chart_builder] {chart_id} failed: {e}")

    return charts


def _apply_base_layout(fig: go.Figure) -> None:
    fig.update_layout(
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        margin=dict(l=48, r=24, t=16, b=48),
        font=dict(family="Inter, sans-serif", size=12),
        legend=dict(
            orientation="h",
            yanchor="bottom",
            y=-0.35,
            xanchor="center",
            x=0.5,
        ),
        hovermode="closest",
    )


# ── Chart 1: Sales & Profit Trend ─────────────────────────────────────────────
def _sales_profit_trend(df: pd.DataFrame) -> go.Figure:
    df = df.copy()
    df["Month"] = df["Order Date"].dt.to_period("M").dt.to_timestamp()
    monthly = (
        df.groupby("Month")
        .agg(Sales=("Sales", "sum"), Profit=("Profit", "sum"))
        .reset_index()
    )

    fig = go.Figure()
    fig.add_trace(go.Scatter(
        x=monthly["Month"], y=monthly["Sales"],
        name="Sales", mode="lines+markers",
        line=dict(color=BLUE, width=2),
        fill="tozeroy", fillcolor="rgba(79,129,189,0.08)",
        hovertemplate="<b>%{x|%b %Y}</b><br>Sales: $%{y:,.0f}<extra></extra>",
    ))
    fig.add_trace(go.Scatter(
        x=monthly["Month"], y=monthly["Profit"],
        name="Profit", mode="lines+markers",
        line=dict(color=ORANGE, width=2),
        fill="tozeroy", fillcolor="rgba(247,150,70,0.08)",
        hovertemplate="<b>%{x|%b %Y}</b><br>Profit: $%{y:,.0f}<extra></extra>",
    ))
    fig.update_xaxes(showgrid=True, gridcolor="rgba(128,128,128,0.15)")
    fig.update_yaxes(showgrid=True, gridcolor="rgba(128,128,128,0.15)", tickprefix="$")
    return fig


# ── Chart 2: Sales by Category ────────────────────────────────────────────────
def _sales_by_category(df: pd.DataFrame) -> go.Figure:
    cat_data = df.groupby("Category")["Sales"].sum().reset_index()
    fig = px.pie(
        cat_data, values="Sales", names="Category",
        hole=0.48, color_discrete_sequence=COLORS,
    )
    fig.update_traces(
        textposition="inside",
        textinfo="percent+label",
        hovertemplate="<b>%{label}</b><br>Sales: $%{value:,.0f}<br>Share: %{percent}<extra></extra>",
    )
    return fig


# ── Chart 3: Sales by Sub-Category ────────────────────────────────────────────
def _sales_by_subcategory(df: pd.DataFrame) -> go.Figure:
    sub = (
        df.groupby("Sub-Category")["Sales"]
        .sum()
        .reset_index()
        .sort_values("Sales", ascending=True)
    )
    fig = px.bar(
        sub, x="Sales", y="Sub-Category", orientation="h",
        color="Sales", color_continuous_scale="Blues",
    )
    fig.update_traces(
        hovertemplate="<b>%{y}</b><br>Sales: $%{x:,.0f}<extra></extra>",
    )
    fig.update_layout(coloraxis_showscale=False)
    fig.update_xaxes(showgrid=True, gridcolor="rgba(128,128,128,0.15)", tickprefix="$")
    fig.update_yaxes(showgrid=False)
    return fig


# ── Chart 4: Sales by Market & Region ─────────────────────────────────────────
def _sales_by_market_region(df: pd.DataFrame) -> go.Figure:
    data = (
        df.groupby(["Market", "Region"])
        .agg(Sales=("Sales", "sum"), Profit=("Profit", "sum"))
        .reset_index()
    )
    fig = px.bar(
        data, x="Market", y="Sales", color="Region",
        barmode="group", color_discrete_sequence=COLORS,
        hover_data={"Profit": ":,.0f", "Sales": ":,.0f"},
    )
    fig.update_xaxes(showgrid=False)
    fig.update_yaxes(showgrid=True, gridcolor="rgba(128,128,128,0.15)", tickprefix="$")
    return fig


# ── Chart 5: Sales by Customer Segment ────────────────────────────────────────
def _segment_breakdown(df: pd.DataFrame) -> go.Figure:
    seg = df.groupby("Segment").agg(Sales=("Sales", "sum")).reset_index()
    fig = px.pie(
        seg, values="Sales", names="Segment",
        hole=0.48, color_discrete_sequence=px.colors.qualitative.Pastel,
    )
    fig.update_traces(
        textposition="inside",
        textinfo="percent+label",
        hovertemplate="<b>%{label}</b><br>Sales: $%{value:,.0f}<br>Share: %{percent}<extra></extra>",
    )
    return fig


# ── Chart 6: Top 10 Products by Profit ────────────────────────────────────────
def _top_products(df: pd.DataFrame) -> go.Figure:
    prod = (
        df.groupby("Product Name")
        .agg(Profit=("Profit", "sum"), Sales=("Sales", "sum"))
        .reset_index()
        .nlargest(10, "Profit")
        .sort_values("Profit", ascending=True)
    )
    prod["Label"] = prod["Product Name"].str[:38].str.strip() + "…"
    fig = px.bar(
        prod, x="Profit", y="Label", orientation="h",
        color="Profit", color_continuous_scale="RdYlGn",
        custom_data=["Product Name"],
    )
    fig.update_traces(
        hovertemplate="<b>%{customdata[0]}</b><br>Profit: $%{x:,.0f}<extra></extra>",
    )
    fig.update_layout(coloraxis_showscale=False)
    fig.update_xaxes(showgrid=True, gridcolor="rgba(128,128,128,0.15)", tickprefix="$")
    fig.update_yaxes(showgrid=False)
    return fig


# ── Chart 7: Discount vs Profit ────────────────────────────────────────────────
def _discount_vs_profit(df: pd.DataFrame) -> go.Figure:
    order_data = (
        df.groupby(["Order ID", "Category"])
        .agg(Discount=("Discount", "mean"), Profit=("Profit", "sum"), Sales=("Sales", "sum"))
        .reset_index()
    )
    fig = px.scatter(
        order_data, x="Discount", y="Profit",
        color="Category", size="Sales",
        color_discrete_sequence=COLORS,
        opacity=0.65,
        hover_data={"Order ID": True, "Sales": ":,.0f", "Profit": ":,.0f"},
    )
    fig.update_traces(marker=dict(line=dict(width=0.5, color="rgba(255,255,255,0.4)")))
    fig.update_xaxes(
        tickformat=".0%", title_text="Discount Rate",
        showgrid=True, gridcolor="rgba(128,128,128,0.15)",
    )
    fig.update_yaxes(
        showgrid=True, gridcolor="rgba(128,128,128,0.15)", tickprefix="$",
    )
    fig.add_hline(
        y=0, line_dash="dash",
        line_color="rgba(239,68,68,0.5)", line_width=1.5,
    )
    return fig


# ── Chart 8: Ship Mode & Order Priority ───────────────────────────────────────
def _ship_mode_priority(df: pd.DataFrame) -> go.Figure:
    data = (
        df.groupby(["Ship Mode", "Order Priority"])["Sales"]
        .sum()
        .reset_index()
    )
    fig = px.bar(
        data, x="Ship Mode", y="Sales", color="Order Priority",
        barmode="stack", color_discrete_sequence=COLORS,
    )
    fig.update_traces(
        hovertemplate="<b>%{x}</b> — %{data.name}<br>Sales: $%{y:,.0f}<extra></extra>",
    )
    fig.update_xaxes(showgrid=False)
    fig.update_yaxes(showgrid=True, gridcolor="rgba(128,128,128,0.15)", tickprefix="$")
    return fig
