export const UNASSIGNED_LANE_ID = 'unassigned';

// Stable, viewer-independent "primary assignee" used to place a card in exactly one swimlane.
// (selectUsersByCardId floats the current user first, which would make placement depend on who is looking.)
export const getPrimaryUserId = (cardModel) => {
  const users = cardModel.users.toRefArray();
  if (users.length === 0) {
    return UNASSIGNED_LANE_ID;
  }

  return [...users].sort((a, b) => a.name.localeCompare(b.name) || (a.id < b.id ? -1 : 1))[0].id;
};
