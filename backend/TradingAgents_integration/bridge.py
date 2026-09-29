import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../TradingAgents')))

try:
    from tradingagents.graph.trading_agents_graph import TradingAgentsGraph
    from tradingagents.default_config import DEFAULT_CONFIG
except ImportError as e:
    print(f"Error importing TradingAgents: {e}")

def run_agent_analysis(ticker: str, target_date: str):
    config = DEFAULT_CONFIG.copy()
    ta = TradingAgentsGraph(debug=False, config=config)
    _, decision = ta.propagate(ticker, target_date)
    return decision
