export const ROLES = {
  ADMIN: 'ADMIN',
  CUSTOMER: 'CUSTOMER',
  AGENT: 'AGENT'
};

export const getRoleDisplayName = (role) => {
  switch (role) {
    case ROLES.ADMIN:
      return 'Administrator';
    case ROLES.CUSTOMER:
      return 'Customer';
    case ROLES.AGENT:
      return 'Delivery Agent';
    default:
      return role;
  }
};
