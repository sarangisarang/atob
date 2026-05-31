export default {
  appName: 'ATOB ტრანსპორტი',

  login: 'შესვლა', logout: 'გასვლა',
  username: 'მომხმარებელი', password: 'პაროლი',
  loginError: 'მომხმარებელი ან პაროლი არასწორია',
  serverError: 'სერვერთან კავშირი ვერ მოხდა',
  loginBtn: 'შესვლა', fillBoth: 'შეიყვანეთ მომხმარებელი და პაროლი',

  dashboard: 'მთავარი', orders: 'შეკვეთები',
  drivers: 'მძღოლები', settings: 'პარამეტრები',

  recentOrders: 'ბოლო შეკვეთები', noRecent: 'შეკვეთები არ არის',

  stat: {
    total: 'სულ', Pending: 'მოლოდინი', Processing: 'მუშავდება',
    WaitingCarrier: 'მძღოლი', Shipped: 'გზაში',
    Delivered: 'ჩაბარდა', Cancelled: 'გაუქმდა',
  },

  status: {
    Pending: 'მოლოდინი', Processing: 'მუშავდება',
    WaitingCarrier: 'მძღოლის მოლოდინი', Shipped: 'გზაში',
    Delivered: 'ჩაბარდა', Cancelled: 'გაუქმდა',
  },

  carrierStatus: {
    Assigned: 'მიენიჭა', PickedUp: 'გამოიტანა', Delivered: 'ჩააბარა',
  },

  searchPlaceholder: 'ძიება ID ან კლიენტი...',
  noOrders: 'შეკვეთები ვერ მოიძებნა', all: 'ყველა',

  orderDetails: 'შეკვეთის დეტალი', orderNo: 'ნომერი',
  orderDate: 'შეკვეთის თარიღი', shippingDate: 'გგარების თარიღი',
  deliveredDate: 'ჩაბარების თარიღი', route: 'მარშრუტი',
  from: 'საიდან', to: 'სადა',
  customerSection: 'კლიენტი', name: 'სახელი',
  email: 'ელფოსტა', phone: 'ტელეფონი', city: 'ქალაქი',
  productSection: 'პროდუქტი', description: 'აღწერა', stock: 'მარაგი',
  shippingSection: 'გადაზიდვა', statusLabel: 'სტატუსი',
  driver: 'მძღოლი', unassigned: 'მიუნიჭებელი',
  trackGPS: '📍 GPS თვალყური', actionsSection: 'მოქმედებები',
  loadError: 'მონაცემების ჩატვირთვა ვერ მოხდა',
  actionError: 'მოქმედება ვერ შესრულდა',
  confirmAction: 'დადასტურება',
  confirmMsg: 'გსურთ ამ მოქმედების შესრულება?',
  yes: 'დიახ', no: 'არა',

  action: {
    processing: '▶ დამუშავებაში',
    waitingCarrier: '🚛 მძღოლის მოლოდინი',
    shipped: '📦 გზაში',
    delivered: '✅ ჩაბარება',
    cancel: '✕ გაუქმება',
  },

  assignDriver: '👤 მძღოლის მინიჭება',
  selectDriver: 'მძღოლის არჩევა',
  noDriverAvailable: 'თავისუფალი მძღოლი არ არის',
  driverAssigned: 'მძღოლი მიენიჭა',

  gpsTitle: 'GPS თვალყური', updateLocation: '📍 ჩემი ლოკაცია',
  locationUpdated: 'კოორდინატები განახლდა',
  locationError: 'ლოკაციის განახლება ვერ მოხდა',
  permissionDenied: 'GPS ნებართვა საჭიროა',
  pickUp: '▶ გამოიტანა', deliver: '✅ ჩააბარა',
  autoRefresh: 'ავტო განახლება',

  driversTitle: 'მძღოლები', noDrivers: 'მძღოლები ვერ მოიძებნა',
  address: 'მისამართი', postcode: 'საფოსტო კოდი',

  settingsTitle: 'პარამეტრები', languageSection: 'ენის არჩევანი',
  georgian: 'ქართული', english: 'English',
  appInfo: 'პროგრამის შესახებ', version: 'ვერსია 1.0.0',
  logoutBtn: 'სისტემიდან გასვლა',

  // Create Order
  createOrder: 'ახალი შეკვეთა', createOrderBtn: 'შეკვეთის გაფორმება',
  selectCustomer: 'კლიენტის არჩევა', selectProduct: 'პროდუქტის არჩევა',
  selectFrom: 'გასვლის ადგილი', selectTo: 'დანიშნულება',
  shippingDateLabel: 'სასურველი გგარების თარიღი',
  orderCreated: 'შეკვეთა წარმატებით გაფორმდა',
  orderCreateError: 'შეკვეთის გაფორმება ვერ მოხდა',
  outOfStock: 'პროდუქტი არ არის მარაგში',
  stepCustomer: 'კლიენტი', stepProduct: 'პროდუქტი',
  stepRoute: 'მარშრუტი', stepConfirm: 'დადასტურება',
  stockAvailable: 'მარაგი',

  // Driver view
  myShipment: 'ჩემი გადაზიდვა', noActiveShipment: 'აქტიური გადაზიდვა არ გაქვს',
  driverWelcome: 'გამარჯობა',

  // Customer view
  shop: 'მაღაზია', myOrders: 'ჩემი შეკვეთები',
  browseProducts: 'პროდუქტები', placeOrder: 'შეკვეთა',
  customerWelcome: 'გამარჯობა', noMyOrders: 'შეკვეთები ჯერ არ გაქვს',
  orderFrom: 'მარაგიდან შეკვეთა', inStock: 'მარაგშია', outOfStockMsg: 'მარაგი ამოწურულია',
  selectPickup: 'გასვლის ადგილი', selectDelivery: 'მიტანის ადგილი',
  orderPlaced: 'შეკვეთა გაფორმდა!', orderPlacedMsg: 'თქვენი შეკვეთა წარმატებით გაიგზავნა.',

  // Product management (admin)
  products: 'პროდუქტები', addProduct: 'პროდუქტის დამატება', editProduct: 'პროდუქტის რედაქტირება',
  noProducts: 'პროდუქტები ვერ მოიძებნა', productSaved: 'პროდუქტი შენახულია',
  productDeleted: 'პროდუქტი წაიშალა', imageUrl: 'სურათის URL (სურვილისამებრ)',
  stockLabel: 'მარაგის რაოდენობა', confirmDelete: 'ეს პროდუქტი წაიშალოს?',

  loading: 'იტვირთება...', error: 'შეცდომა',
  retry: 'ხელახლა ცდა', back: 'უკან', ok: 'OK',

  // Registration
  registerBtn: 'რეგისტრაცია',
  registerTitle: 'ანგარიშის შექმნა',
  registerAsCustomer: 'კლიენტი',
  registerAsDriver: 'მძღოლი',
  chooseRole: 'გსურს რეგისტრაცია როგორც...',
  registerBtn2: 'ანგარიშის შექმნა',
  registrationSuccess: 'ანგარიში შეიქმნა! გთხოვს შეხვიდე სისტემაში.',
  registrationError: 'რეგისტრაცია ვერ მოხდა. კიდევ სცადე.',
  firstName: 'სახელი',
  lastName: 'გვარი',
  confirmPassword: 'გაიმეორე პაროლი',
  passwordTooShort: 'პაროლი უნდა იყოს მინიმუმ 8 სიმბოლო',
  passwordMismatch: 'პაროლები არ ემთხვევა',
  emailTaken: 'ამ ელ.ფოსტით ანგარიში უკვე არსებობს',

  // Customer order timeline + proof
  tl_created: 'შეკვეთა შექმნილია',
  tl_assigned: 'მძღოლი დანიშნულია',
  tl_pickup: 'მძღოლი მიდის ასაღებად',
  tl_pickedup: 'ტვირთი აღებულია',
  tl_transit: 'გზაშია',
  tl_delivered: 'მიტანილია',
  tl_cancelled: 'შეკვეთა გაუქმდა',
  tl_failed: 'მიტანა ვერ მოხერხდა',
  proofTitle: 'მიტანის დადასტურება',
  receiver: 'მიმღები',

  // Customer order form
  pickupSection: 'აღება', deliverySection: 'მიტანა', shipmentSection: 'გადაზიდვა', scheduleSection: 'გრაფიკი',
  transportTypeLabel: 'ტრანსპორტის ტიპი', cargoTypeLabel: 'ტვირთის ტიპი', cargoNameLabel: 'ტვირთის სახელი',
  weightKgLabel: 'წონა (კგ)', quantityLabel: 'რაოდენობა', notesLabel: 'შენიშვნა',
  tt_light: 'მსუბუქი', tt_truck: 'სატვირთო', tt_trailer: 'ტრეილერი',
  ct_general: 'ზოგადი ტვირთი', ct_vehicle: 'ავტომობილი', ct_construction: 'სამშენებლო', ct_equipment: 'ტექნიკა', ct_other: 'სხვა',
  cityRequired: 'აღების და მიტანის ქალაქი სავალდებულოა',
  cargoRequired: 'ტვირთის სახელი სავალდებულოა',
  weightInvalid: 'წონა უნდა იყოს 0-ზე მეტი',
  qtyInvalid: 'რაოდენობა მინიმუმ 1',
  dateInvalid: 'თარიღის ფორმატი: YYYY-MM-DD',

  // Chat
  messages: 'შეტყობინებები',
  noContacts: 'კონტაქტები არ არის',
  noContactsHint: 'კონტაქტები გამოჩნდება შეკვეთის გააქტიურების შემდეგ.',
  typeMessage: 'შეტყობინების ჩაწერა...',
  send: 'გაგზავნა',
};
