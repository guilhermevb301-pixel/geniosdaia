/**
 * Build correct challenge order based on predecessor chain
 * Instead of relying on order_index, we traverse the dependency tree
 */

interface ChallengeLink {
  challengeId: string;
  orderIndex: number;
  isInitialActive: boolean;
  predecessorChallengeId: string | null;
}

/**
 * Returns an ordered array of challenge IDs following the predecessor chain
 * Initial challenges (no predecessor or marked as initial) come first,
 * followed by their successors in chain order
 */
export function buildChallengeOrder(links: ChallengeLink[]): string[] {
  if (links.length === 0) return [];

  const result: string[] = [];
  const processedIds = new Set<string>();

  // Build a map of predecessor -> successors for quick lookup
  const successorMap = new Map<string, ChallengeLink[]>();
  links.forEach((link) => {
    if (link.predecessorChallengeId) {
      const existing = successorMap.get(link.predecessorChallengeId) || [];
      existing.push(link);
      successorMap.set(link.predecessorChallengeId, existing);
    }
  });

  // Find all initial challenges:
  // 1. Explicitly marked as is_initial_active
  // 2. OR has no predecessor
  const initials = links.filter(
    (l) => l.isInitialActive || l.predecessorChallengeId === null
  );

  // Sort initials by order_index for consistent ordering when multiple initials exist
  initials.sort((a, b) => a.orderIndex - b.orderIndex);

  // Helper function to recursively add a challenge and its successors
  const addWithSuccessors = (challengeId: string) => {
    if (processedIds.has(challengeId)) return;

    processedIds.add(challengeId);
    result.push(challengeId);

    // Find all successors of this challenge
    const successors = successorMap.get(challengeId) || [];
    
    // Sort successors by order_index for consistent ordering
    successors.sort((a, b) => a.orderIndex - b.orderIndex);

    // Recursively add each successor
    successors.forEach((successor) => {
      addWithSuccessors(successor.challengeId);
    });
  };

  // Process each initial challenge
  initials.forEach((initial) => {
    addWithSuccessors(initial.challengeId);
  });

  // Add any remaining challenges that weren't reached (orphans)
  // This handles edge cases where links might be misconfigured
  links.forEach((link) => {
    if (!processedIds.has(link.challengeId)) {
      result.push(link.challengeId);
    }
  });

  return result;
}

/**
 * Sort progress records based on challenge order derived from links
 */
export function sortProgressByChallengOrder<T extends { daily_challenge_id: string }>(
  progress: T[],
  links: ChallengeLink[]
): T[] {
  const orderedIds = buildChallengeOrder(links);
  const orderMap = new Map(orderedIds.map((id, idx) => [id, idx]));

  return [...progress].sort((a, b) => {
    const orderA = orderMap.get(a.daily_challenge_id) ?? Infinity;
    const orderB = orderMap.get(b.daily_challenge_id) ?? Infinity;
    return orderA - orderB;
  });
}
