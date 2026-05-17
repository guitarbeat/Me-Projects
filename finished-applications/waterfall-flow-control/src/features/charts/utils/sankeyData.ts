import { Transaction } from '@/types';

export interface SankeyNode {
  id: string;
  name: string;
  category: 'revenue' | 'balance' | 'expense';
  // * Add value property for better sorting
  value?: number;
}

export interface SankeyLink {
  source: string;
  target: string;
  value: number;
}

export interface SankeyData {
  nodes: SankeyNode[];
  links: SankeyLink[];
}

export const SANKEY_CONFIG = {
  MARGIN: { top: 10, right: 10, bottom: 10, left: 10 },
  NODE_WIDTH: 8,
  NODE_PADDING: 30,
};

export const getSankeyDimensions = (nodeCount: number = 0) => {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const viewportWidth =
    typeof window !== 'undefined' ? window.innerWidth : 1024;
  const viewportHeight =
    typeof window !== 'undefined' ? window.innerHeight : 768;

  // Simplified width calculation
  const width = viewportWidth - (isMobile ? 32 : 64);

  // Simplified height calculation
  const baseHeight = isMobile ? 250 : 400;
  const heightPerNode = isMobile ? 22 : 28;
  const maxHeight = isMobile ? 500 : 800;

  const calculatedHeight = baseHeight + nodeCount * heightPerNode;
  const height = Math.min(
    calculatedHeight,
    maxHeight,
    viewportHeight - (isMobile ? 120 : 160)
  );

  return {
    width: Math.max(width, 300),
    height: Math.max(height, 200),
    nodeWidth: isMobile ? 6 : SANKEY_CONFIG.NODE_WIDTH,
    nodePadding: isMobile ? 18 : SANKEY_CONFIG.NODE_PADDING,
    isMobile,
  };
};

// Helper function to sort transactions and create revenue nodes
function createRevenueNodes(transactions: Transaction[]): {
  sortedTransactions: Transaction[];
  revenueTransactions: Transaction[];
  nodes: SankeyNode[];
} {
  const nodes: SankeyNode[] = [];

  // Sort transactions by date
  const sortedTransactions = [...transactions].sort(
    // Optimize date sorting by using string comparison for ISO dates
    (a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0)
  );

  // Create revenue source nodes
  const revenueTransactions = sortedTransactions.filter(t => t.inflow > 0);
  revenueTransactions.forEach(transaction => {
    nodes.push({
      id: `revenue-${transaction.id}`,
      name: transaction.person,
      category: 'revenue',
      // * Add value for better node sizing
      value: transaction.inflow,
    });
  });

  return { sortedTransactions, revenueTransactions, nodes };
}

export const processSankeyData = (
  transactions: Transaction[],
  mode: 'detailed' | 'summary' = 'detailed'
): SankeyData => {
  if (transactions.length === 0) {
    return { nodes: [], links: [] };
  }

  if (mode === 'summary') {
    return processSummarySankeyData(transactions);
  }

  // Use shared helper function
  const { sortedTransactions, revenueTransactions, nodes } =
    createRevenueNodes(transactions);
  const links: SankeyLink[] = [];

  // Create balance nodes for each stage
  let runningBalance = 0;
  const totalRevenue = revenueTransactions.reduce(
    (sum, t) => sum + t.inflow,
    0
  );

  if (totalRevenue > 0) {
    runningBalance = totalRevenue;
    nodes.push({
      id: 'balance-0',
      name: `$${runningBalance}`,
      category: 'balance',
      // * Add value for better node sizing
      value: runningBalance,
    });

    // Link revenue sources to initial balance
    revenueTransactions.forEach(transaction => {
      links.push({
        source: `revenue-${transaction.id}`,
        target: 'balance-0',
        value: transaction.inflow,
      });
    });
  }

  // Process expenses and create balance stages
  const expenseTransactions = sortedTransactions.filter(t => t.outflow > 0);
  expenseTransactions.forEach((transaction, index) => {
    const newBalance = runningBalance - transaction.outflow;

    // Create expense node
    nodes.push({
      id: `expense-${transaction.id}`,
      name: transaction.name,
      category: 'expense',
      // * Add value for better node sizing
      value: transaction.outflow,
    });

    // Create new balance node
    const balanceNodeId = `balance-${index + 1}`;
    nodes.push({
      id: balanceNodeId,
      name: `$${Math.abs(newBalance)}`,
      category: 'balance',
      // * Add value for better node sizing
      value: Math.abs(newBalance),
    });

    // Link previous balance to expense
    const previousBalanceId = `balance-${index}`;
    links.push({
      source: previousBalanceId,
      target: `expense-${transaction.id}`,
      value: transaction.outflow,
    });

    // Link previous balance to new balance (remaining amount)
    if (newBalance > 0) {
      links.push({
        source: previousBalanceId,
        target: balanceNodeId,
        value: newBalance,
      });
    } else if (newBalance < 0) {
      // * Handle negative balance case - update balance node name
      const balanceNode = nodes.find(n => n.id === balanceNodeId);
      if (balanceNode) {
        balanceNode.name = `($${Math.abs(newBalance)})`;
        balanceNode.value = Math.abs(newBalance);
      }
    }

    runningBalance = newBalance;
  });

  // * Validate and filter links to prevent weird circles issue
  const validatedLinks = validateAndFilterLinks(links);

  // * Validate node connectivity and remove orphaned nodes
  const { validNodes, validLinks } = validateNodeConnectivity(
    nodes,
    validatedLinks
  );

  return { nodes: validNodes, links: validLinks };
};

// * Minimum link value to prevent zero-length SVG paths that cause visual artifacts
const MIN_LINK_VALUE = 0.01;

// * Helper function to validate and filter links to prevent weird circles issue
function validateAndFilterLinks(links: SankeyLink[]): SankeyLink[] {
  return links.filter(link => {
    // * Filter out links with invalid source/target references
    if (!link.source || !link.target || link.source === link.target) {
      console.warn(
        `Filtered out invalid link: ${link.source} -> ${link.target}`
      );
      return false;
    }

    // * Filter out zero or negative values that cause SVG rendering issues
    if (!link.value || link.value <= 0) {
      console.warn(
        `Filtered out zero/negative link: ${link.source} -> ${link.target} (value: ${link.value})`
      );
      return false;
    }

    // * Ensure minimum value to prevent zero-length SVG paths
    if (link.value < MIN_LINK_VALUE) {
      link.value = MIN_LINK_VALUE;
    }

    return true;
  });
}

// * Helper function to validate node connectivity and remove orphaned nodes
function validateNodeConnectivity(
  nodes: SankeyNode[],
  links: SankeyLink[]
): { validNodes: SankeyNode[]; validLinks: SankeyLink[] } {
  // * Create sets of connected node IDs
  const connectedNodeIds = new Set<string>();
  links.forEach(link => {
    connectedNodeIds.add(link.source);
    connectedNodeIds.add(link.target);
  });

  // * Filter out orphaned nodes (nodes with no connections)
  const validNodes = nodes.filter(node => {
    const isConnected = connectedNodeIds.has(node.id);
    if (!isConnected) {
      console.warn(`Removed orphaned node: ${node.id} (${node.name})`);
    }
    return isConnected;
  });

  return { validNodes, validLinks: links };
}

function processSummarySankeyData(transactions: Transaction[]): SankeyData {
  const links: SankeyLink[] = [];
  const expenseMap: Record<string, string> = {}; // name to node id

  // Use shared helper function
  const { sortedTransactions, revenueTransactions, nodes } =
    createRevenueNodes(transactions);

  // Create initial balance
  let runningBalance = revenueTransactions.reduce(
    (sum, t) => sum + t.inflow,
    0
  );
  if (runningBalance > 0) {
    nodes.push({
      id: 'balance-0',
      name: `$${runningBalance}`,
      category: 'balance',
      // * Add value for better node sizing
      value: runningBalance,
    });
    // Link revenues to initial balance
    revenueTransactions.forEach(transaction => {
      links.push({
        source: `revenue-${transaction.id}`,
        target: 'balance-0',
        value: transaction.inflow,
      });
    });
  }

  // Process expenses sequentially with grouping
  const expenseTransactions = sortedTransactions.filter(t => t.outflow > 0);
  expenseTransactions.forEach((transaction, index) => {
    const newBalance = runningBalance - transaction.outflow;

    // Get or create grouped expense node
    let expenseId = expenseMap[transaction.name];
    if (!expenseId) {
      expenseId = `expense-${transaction.name.replace(/\s+/g, '-')}`;
      nodes.push({
        id: expenseId,
        name: transaction.name,
        category: 'expense',
        // * Add value for better node sizing
        value: transaction.outflow,
      });
      expenseMap[transaction.name] = expenseId;
    } else {
      // * Update existing expense node value
      const existingNode = nodes.find(n => n.id === expenseId);
      if (existingNode) {
        existingNode.value = (existingNode.value || 0) + transaction.outflow;
      }
    }

    // Create new balance node
    const balanceNodeId = `balance-${index + 1}`;
    nodes.push({
      id: balanceNodeId,
      name: `$${Math.abs(newBalance)}`,
      category: 'balance',
      // * Add value for better node sizing
      value: Math.abs(newBalance),
    });

    // Link previous balance to expense (add to grouped)
    const previousBalanceId = `balance-${index}`;
    links.push({
      source: previousBalanceId,
      target: expenseId,
      value: transaction.outflow,
    });

    // Link previous balance to new balance (remaining)
    if (newBalance > 0) {
      links.push({
        source: previousBalanceId,
        target: balanceNodeId,
        value: newBalance,
      });
    } else if (newBalance < 0) {
      // * Handle negative balance case - update balance node name
      const balanceNode = nodes.find(n => n.id === balanceNodeId);
      if (balanceNode) {
        balanceNode.name = `($${Math.abs(newBalance)})`;
        balanceNode.value = Math.abs(newBalance);
      }
    }

    runningBalance = newBalance;
  });

  // * Validate and filter links to prevent weird circles issue
  const validatedLinks = validateAndFilterLinks(links);

  // * Validate node connectivity and remove orphaned nodes
  const { validNodes, validLinks } = validateNodeConnectivity(
    nodes,
    validatedLinks
  );

  // Assign custom depths for layout
  const maxDepth = expenseTransactions.length + 1; // balances from 1 to length+1, expenses at max+1
  validNodes.forEach(node => {
    if (node.category === 'revenue') {
      (node as SankeyNode & { depth: number }).depth = 0;
    } else if (node.category === 'balance') {
      const balanceIndex = parseInt(node.id.split('-')[1]);
      (node as SankeyNode & { depth: number }).depth = balanceIndex + 1;
    } else if (node.category === 'expense') {
      (node as SankeyNode & { depth: number }).depth = maxDepth + 1;
    }
  });

  return { nodes: validNodes, links: validLinks };
}
