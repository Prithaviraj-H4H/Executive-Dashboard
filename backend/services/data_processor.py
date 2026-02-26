import io
import pandas as pd
from typing import Dict, Any
from models.schemas import KPIData, FilterOptions

REQUIRED_COLUMNS = [
    "Row ID", "Order ID", "Order Date", "Ship Date", "Ship Mode",
    "Customer ID", "Customer Name", "Segment", "City", "State",
    "Country", "Postal Code", "Market", "Region", "Product ID",
    "Category", "Sub-Category", "Product Name", "Sales", "Quantity",
    "Discount", "Profit", "Shipping Cost", "Order Priority",
]


def load_and_validate(file_bytes: bytes, filename: str) -> pd.DataFrame:
    if filename.lower().endswith(".csv"):
        df = pd.read_csv(io.BytesIO(file_bytes))
    else:
        df = pd.read_excel(io.BytesIO(file_bytes))

    df.columns = df.columns.str.strip()

    missing = [col for col in REQUIRED_COLUMNS if col not in df.columns]
    if missing:
        raise ValueError(f"Missing required columns: {missing}")

    df["Order Date"] = pd.to_datetime(df["Order Date"], dayfirst=False, errors="coerce")
    df["Ship Date"] = pd.to_datetime(df["Ship Date"], dayfirst=False, errors="coerce")

    for col in ["Sales", "Quantity", "Discount", "Profit", "Shipping Cost"]:
        df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0)

    df.dropna(subset=["Order Date"], inplace=True)

    return df


def apply_filters(df: pd.DataFrame, filters: Dict[str, Any]) -> pd.DataFrame:
    if filters.get("date_start"):
        df = df[df["Order Date"] >= pd.to_datetime(filters["date_start"])]
    if filters.get("date_end"):
        df = df[df["Order Date"] <= pd.to_datetime(filters["date_end"])]
    if filters.get("category"):
        df = df[df["Category"].isin(filters["category"])]
    if filters.get("sub_category"):
        df = df[df["Sub-Category"].isin(filters["sub_category"])]
    if filters.get("market"):
        df = df[df["Market"].isin(filters["market"])]
    if filters.get("region"):
        df = df[df["Region"].isin(filters["region"])]
    if filters.get("segment"):
        df = df[df["Segment"].isin(filters["segment"])]
    if filters.get("ship_mode"):
        df = df[df["Ship Mode"].isin(filters["ship_mode"])]
    if filters.get("order_priority"):
        df = df[df["Order Priority"].isin(filters["order_priority"])]
    return df


def compute_kpis(df: pd.DataFrame) -> KPIData:
    total_sales = round(float(df["Sales"].sum()), 2)
    total_profit = round(float(df["Profit"].sum()), 2)
    profit_margin = round((total_profit / total_sales * 100) if total_sales > 0 else 0.0, 2)
    total_orders = int(df["Order ID"].nunique())
    avg_order_value = round(total_sales / total_orders if total_orders > 0 else 0.0, 2)
    total_shipping_cost = round(float(df["Shipping Cost"].sum()), 2)
    avg_discount = round(float(df["Discount"].mean()) * 100, 2)

    # Repeat Customer Rate: % of customers who placed more than one unique order
    customer_order_counts = df.groupby("Customer ID")["Order ID"].nunique()
    total_customers = len(customer_order_counts)
    repeat_customers = int((customer_order_counts > 1).sum())
    repeat_customer_rate = round(
        (repeat_customers / total_customers * 100) if total_customers > 0 else 0.0, 2
    )

    return KPIData(
        total_sales=total_sales,
        total_profit=total_profit,
        profit_margin=profit_margin,
        total_orders=total_orders,
        repeat_customer_rate=repeat_customer_rate,
        avg_order_value=avg_order_value,
        total_shipping_cost=total_shipping_cost,
        avg_discount=avg_discount,
    )


def get_filter_options(df: pd.DataFrame) -> FilterOptions:
    categories = sorted(df["Category"].dropna().unique().tolist())
    sub_categories = {
        cat: sorted(df[df["Category"] == cat]["Sub-Category"].dropna().unique().tolist())
        for cat in categories
    }

    markets = sorted(df["Market"].dropna().unique().tolist())
    regions = {
        mkt: sorted(df[df["Market"] == mkt]["Region"].dropna().unique().tolist())
        for mkt in markets
    }

    return FilterOptions(
        categories=categories,
        sub_categories=sub_categories,
        markets=markets,
        regions=regions,
        segments=sorted(df["Segment"].dropna().unique().tolist()),
        ship_modes=sorted(df["Ship Mode"].dropna().unique().tolist()),
        order_priorities=sorted(df["Order Priority"].dropna().unique().tolist()),
        date_range={
            "min_date": df["Order Date"].min().strftime("%Y-%m-%d"),
            "max_date": df["Order Date"].max().strftime("%Y-%m-%d"),
        },
    )
