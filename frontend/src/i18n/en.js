export default {
  availableOrders: 'Available orders', noAvailableOrders: 'No available orders right now', acceptOrder: 'Accept',
  appName: 'ATOB Transport',

  login: 'Sign In', logout: 'Sign Out',
  username: 'Username', password: 'Password',
  loginError: 'Invalid username or password',
  serverError: 'Could not connect to server',
  loginBtn: 'Sign In', fillBoth: 'Please enter username and password',

  dashboard: 'Dashboard', orders: 'Orders',
  drivers: 'Drivers', settings: 'Settings',

  recentOrders: 'Recent Orders', noRecent: 'No orders yet',

  stat: {
    total: 'Total', Pending: 'Pending', Processing: 'Processing',
    WaitingCarrier: 'Carrier', Shipped: 'Shipped',
    Delivered: 'Delivered', Cancelled: 'Cancelled',
  },

  status: {
    Pending: 'Pending', Processing: 'Processing',
    WaitingCarrier: 'Awaiting Carrier', Shipped: 'Shipped',
    Delivered: 'Delivered', Cancelled: 'Cancelled',
  },

  carrierStatus: {
    Assigned: 'Assigned', PickedUp: 'Picked Up', Delivered: 'Delivered',
  },

  searchPlaceholder: 'Search by ID or customer...',
  noOrders: 'No orders found', all: 'All',

  orderDetails: 'Order Details', orderNo: 'Number',
  orderDate: 'Order Date', shippingDate: 'Ship Date',
  deliveredDate: 'Delivered Date', route: 'Route',
  from: 'From', to: 'To',
  customerSection: 'Customer', name: 'Name',
  email: 'Email', phone: 'Phone', city: 'City',
  productSection: 'Product', description: 'Description', stock: 'Stock',
  shippingSection: 'Shipping', statusLabel: 'Status',
  driver: 'Driver', unassigned: 'Unassigned',
  trackGPS: '📍 Track GPS', actionsSection: 'Actions',
  loadError: 'Failed to load data', actionError: 'Action failed',
  confirmAction: 'Confirm', confirmMsg: 'Are you sure?',
  yes: 'Yes', no: 'No',

  action: {
    processing: '▶ Move to Processing',
    waitingCarrier: '🚛 Await Carrier',
    shipped: '📦 Mark Shipped',
    delivered: '✅ Mark Delivered',
    cancel: '✕ Cancel Order',
  },

  assignDriver: '👤 Assign Driver',
  selectDriver: 'Select a driver',
  noDriverAvailable: 'No available drivers',
  driverAssigned: 'Driver assigned',

  gpsTitle: 'GPS Tracking', updateLocation: '📍 Update My Location',
  locationUpdated: 'Location updated',
  locationError: 'Failed to update location',
  permissionDenied: 'GPS permission required',
  pickUp: '▶ Pick Up', deliver: '✅ Deliver',
  autoRefresh: 'Auto-refresh',

  driversTitle: 'Drivers', noDrivers: 'No drivers found',
  address: 'Address', postcode: 'Postcode',

  settingsTitle: 'Settings', languageSection: 'Language',
  georgian: 'Georgian', english: 'English',
  appInfo: 'About', version: 'Version 1.0.0',
  logoutBtn: 'Sign Out',

  // Create Order
  createOrder: 'New Order', createOrderBtn: 'Place Order',
  selectCustomer: 'Select Customer', selectProduct: 'Select Product',
  selectFrom: 'Departure Location', selectTo: 'Destination',
  shippingDateLabel: 'Preferred Shipping Date',
  orderCreated: 'Order placed successfully',
  orderCreateError: 'Failed to create order',
  outOfStock: 'Product is out of stock',
  stepCustomer: 'Customer', stepProduct: 'Product',
  stepRoute: 'Route', stepConfirm: 'Confirm',
  stockAvailable: 'Stock',

  // Driver view
  myShipment: 'My Shipment', noActiveShipment: 'No active shipment assigned',
  driverWelcome: 'Welcome',

  // Customer view
  shop: 'Shop', myOrders: 'My Orders',
  browseProducts: 'Browse Products', placeOrder: 'Place Order',
  customerWelcome: 'Hello', noMyOrders: 'You have no orders yet',
  orderFrom: 'Order from stock', inStock: 'In stock', outOfStockMsg: 'Out of stock',
  selectPickup: 'Pickup Location', selectDelivery: 'Delivery Location',
  orderPlaced: 'Order placed!', orderPlacedMsg: 'Your order has been submitted.',

  // Product management (admin)
  products: 'Products', addProduct: 'Add Product', editProduct: 'Edit Product',
  noProducts: 'No products found', productSaved: 'Product saved',
  productDeleted: 'Product deleted', imageUrl: 'Image URL (optional)',
  stockLabel: 'Stock quantity', confirmDelete: 'Delete this product?',

  loading: 'Loading...', error: 'Error',
  retry: 'Retry', back: 'Back', ok: 'OK',

  // Registration
  registerBtn: 'Create Account',
  registerTitle: 'Create Account',
  registerAsCustomer: 'Customer',
  registerAsDriver: 'Driver',
  chooseRole: 'I want to register as...',
  registerBtn2: 'Create Account',
  registrationSuccess: 'Account created! Please log in.',
  registrationError: 'Registration failed. Please try again.',
  firstName: 'First Name',
  lastName: 'Last Name',
  confirmPassword: 'Confirm Password',
  passwordTooShort: 'Password must be at least 8 characters',
  passwordMismatch: 'Passwords do not match',
  emailTaken: 'An account with this email already exists',

  // Customer order timeline + proof
  tl_created: 'Order created',
  tl_assigned: 'Driver assigned',
  tl_pickup: 'Heading to pickup',
  tl_pickedup: 'Cargo picked up',
  tl_transit: 'On the way',
  tl_delivered: 'Delivered',
  tl_cancelled: 'Order cancelled',
  tl_failed: 'Delivery failed',
  proofTitle: 'Proof of Delivery',
  receiver: 'Received by',

  // Customer order form
  pickupSection: 'Pickup', deliverySection: 'Delivery', shipmentSection: 'Shipment', scheduleSection: 'Schedule',
  transportTypeLabel: 'Transport type', cargoTypeLabel: 'Cargo type', cargoNameLabel: 'Cargo name',
  weightKgLabel: 'Weight (kg)', quantityLabel: 'Quantity', notesLabel: 'Notes',
  tt_light: 'Light', tt_truck: 'Truck', tt_trailer: 'Trailer',
  ct_general: 'General goods', ct_vehicle: 'Vehicle', ct_construction: 'Construction', ct_equipment: 'Equipment', ct_other: 'Other',
  cityRequired: 'Pickup and delivery city are required',
  cargoRequired: 'Cargo name is required',
  weightInvalid: 'Weight must be greater than 0',
  qtyInvalid: 'Quantity must be at least 1',
  dateInvalid: 'Date must be in format YYYY-MM-DD',

  // Chat
  messages: 'Messages',
  noContacts: 'No contacts yet',
  noContactsHint: 'Contacts appear once you have an active order.',
  typeMessage: 'Type a message...',
  send: 'Send',
};
