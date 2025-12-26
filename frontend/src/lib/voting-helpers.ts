import VotingRound, { type IVotingRound } from '@/models/VotingRound';

/**
 * Get the current voting round with explicit, auditable semantics
 *
 * Returns:
 * - { round, isActive: true } if active round exists → voting allowed
 * - { round, isActive: false } if finalized round exists → voting locked
 * - { round: null, isActive: false } if no round → legacy fallback
 *
 * CONCURRENCY SAFETY:
 * This function is safe under concurrent calls because MongoDB's partial unique index
 * on VotingRound.status ensures only ONE active OR finalized round can exist.
 * See VotingRoundSchema index definition in models/VotingRound.ts for details.
 *
 * WHY TWO SEPARATE QUERIES INSTEAD OF { $in: ['active', 'finalized'] }:
 * - Explicit: Makes voting state determination obvious to code reviewers
 * - Auditable: Clear intent for each branch (active vs finalized vs missing)
 * - Maintainable: Future changes to round lifecycle won't break assumptions
 * - Readable: isActive boolean makes voting logic immediately clear
 *
 * USAGE:
 * ```typescript
 * const { round, isActive } = await getCurrentVotingRound();
 *
 * if (!round) {
 *   // No voting system initialized - legacy fallback
 * } else if (!isActive) {
 *   // Voting is locked (round.status === 'finalized')
 * } else {
 *   // Voting is allowed (round.status === 'active')
 * }
 * ```
 */
export async function getCurrentVotingRound(): Promise<{
  round: IVotingRound | null;
  isActive: boolean;
}> {
  // Explicit query 1: Check for active round (voting allowed)
  const activeRound = await VotingRound.findOne({ status: 'active' });
  if (activeRound) {
    return { round: activeRound, isActive: true };
  }

  // Explicit query 2: Check for finalized round (voting locked)
  const finalizedRound = await VotingRound.findOne({ status: 'finalized' });
  if (finalizedRound) {
    return { round: finalizedRound, isActive: false };
  }

  // No current round (legacy system or migration in progress)
  return { round: null, isActive: false };
}
