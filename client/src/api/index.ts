// Centralized API exports
// Import all API services and re-export them for easy access

export { waiterAPI } from "./waiterAPI";
export { customerAPI } from "./customerAPI";
export { chefAPI } from "./chefAPI";
export { cashierAPI } from "./cashierAPI";
export { managerAPI } from "./managerAPI";
export { ownerAPI } from "./ownerAPI";
export { inventoryAPI } from "./inventoryAPI";

// You can also import them all at once:
// import { waiterAPI, customerAPI, chefAPI, cashierAPI, managerAPI, ownerAPI, inventoryAPI } from './api';

// Or import specific ones:
// import { waiterAPI } from './api/waiterAPI';
// import { customerAPI } from './api/customerAPI';
