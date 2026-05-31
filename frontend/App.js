import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';

import { LanguageProvider, useTranslation } from './src/i18n';

import LoginScreen              from './src/screens/LoginScreen';
import DashboardScreen          from './src/screens/DashboardScreen';
import OrdersListScreen         from './src/screens/OrdersListScreen';
import OrderDetailScreen        from './src/screens/OrderDetailScreen';
import GPSTrackingScreen        from './src/screens/GPSTrackingScreen';
import DriversScreen            from './src/screens/DriversScreen';
import SettingsScreen           from './src/screens/SettingsScreen';
import DriverHomeScreen         from './src/screens/DriverHomeScreen';
import CreateOrderScreen        from './src/screens/CreateOrderScreen';
import ProductsScreen           from './src/screens/ProductsScreen';
import ProductFormScreen        from './src/screens/ProductFormScreen';
import CustomerShopScreen       from './src/screens/CustomerShopScreen';
import CustomerOrderFormScreen  from './src/screens/CustomerOrderFormScreen';
import CustomerOrdersScreen     from './src/screens/CustomerOrdersScreen';
import CustomerOrderDetailScreen from './src/screens/CustomerOrderDetailScreen';
import RegisterTypeScreen       from './src/screens/RegisterTypeScreen';
import RegisterFormScreen       from './src/screens/RegisterFormScreen';
import ChatConversationListScreen from './src/screens/ChatConversationListScreen';
import ChatThreadScreen           from './src/screens/ChatThreadScreen';

const Stack = createStackNavigator();
const Tab   = createBottomTabNavigator();

function TabIcon({ emoji, focused }) {
  return (
    <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>
  );
}

function OrdersStack() {
  const { t } = useTranslation();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle:      { backgroundColor: '#1a73e8' },
        headerTintColor:  '#fff',
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Stack.Screen name="OrdersList"   component={OrdersListScreen}   options={{ headerShown: false }} />
      <Stack.Screen name="OrderDetail"  component={OrderDetailScreen}  options={{ title: t('orderDetails') }} />
      <Stack.Screen name="GPSTracking"  component={GPSTrackingScreen}  options={{ title: t('gpsTitle') }} />
      <Stack.Screen name="CreateOrder"  component={CreateOrderScreen}  options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

function ProductsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle:      { backgroundColor: '#1a73e8' },
        headerTintColor:  '#fff',
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Stack.Screen name="ProductsList" component={ProductsScreen}    options={{ headerShown: false }} />
      <Stack.Screen name="ProductForm"  component={ProductFormScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

function CustomerStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CustomerShop"       component={CustomerShopScreen} />
      <Stack.Screen name="CustomerOrderForm"  component={CustomerOrderFormScreen} />
      <Stack.Screen name="CustomerOrders"     component={CustomerOrdersScreen} />
    </Stack.Navigator>
  );
}

function CustomerOrdersStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CustomerOrders"      component={CustomerOrdersScreen} />
      <Stack.Screen name="CustomerOrderDetail" component={CustomerOrderDetailScreen} />
    </Stack.Navigator>
  );
}

function CustomerChatStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ChatConversations" component={ChatConversationListScreen} />
      <Stack.Screen name="ChatThread"        component={ChatThreadScreen} />
    </Stack.Navigator>
  );
}

function DriverChatStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ChatConversations" component={ChatConversationListScreen} />
      <Stack.Screen name="ChatThread"        component={ChatThreadScreen} />
    </Stack.Navigator>
  );
}

function DriverTabs() {
  const { t } = useTranslation();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown:             false,
        tabBarActiveTintColor:   '#1a73e8',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor:  '#E8EDF5',
          height:          62,
          paddingBottom:   8,
          paddingTop:      4,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tab.Screen
        name="DriverHome"
        component={DriverHomeScreen}
        options={{
          tabBarLabel: t('myShipment'),
          tabBarIcon: ({ focused }) => <TabIcon emoji="🚛" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="DriverChat"
        component={DriverChatStack}
        options={{
          tabBarLabel: t('messages'),
          tabBarIcon: ({ focused }) => <TabIcon emoji="💬" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="DriverSettings"
        component={SettingsScreen}
        options={{
          tabBarLabel: t('settings'),
          tabBarIcon: ({ focused }) => <TabIcon emoji="⚙️" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

function MainTabs() {
  const { t } = useTranslation();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown:             false,
        tabBarActiveTintColor:   '#1a73e8',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor:  '#E8EDF5',
          height:          62,
          paddingBottom:   8,
          paddingTop:      4,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: t('dashboard'),
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Orders"
        component={OrdersStack}
        options={{
          tabBarLabel: t('orders'),
          tabBarIcon: ({ focused }) => <TabIcon emoji="📦" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Products"
        component={ProductsStack}
        options={{
          tabBarLabel: t('products'),
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏷" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Drivers"
        component={DriversScreen}
        options={{
          tabBarLabel: t('drivers'),
          tabBarIcon: ({ focused }) => <TabIcon emoji="🚛" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: t('settings'),
          tabBarIcon: ({ focused }) => <TabIcon emoji="⚙️" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

function CustomerTabs() {
  const { t } = useTranslation();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown:             false,
        tabBarActiveTintColor:   '#1a73e8',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: { backgroundColor: '#fff', borderTopColor: '#E8EDF5', height: 62, paddingBottom: 8, paddingTop: 4 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tab.Screen
        name="CustomerShopTab"
        component={CustomerStack}
        options={{
          tabBarLabel: t('shop'),
          tabBarIcon: ({ focused }) => <TabIcon emoji="🛍" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="CustomerOrdersTab"
        component={CustomerOrdersStack}
        options={{
          tabBarLabel: t('myOrders'),
          tabBarIcon: ({ focused }) => <TabIcon emoji="📋" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="CustomerChat"
        component={CustomerChatStack}
        options={{
          tabBarLabel: t('messages'),
          tabBarIcon: ({ focused }) => <TabIcon emoji="💬" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="CustomerSettings"
        component={SettingsScreen}
        options={{
          tabBarLabel: t('settings'),
          tabBarIcon: ({ focused }) => <TabIcon emoji="⚙️" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const [ready,        setReady]        = useState(false);
  const [initialRoute, setInitialRoute] = useState('Login');

  useEffect(() => {
    AsyncStorage.multiGet(['authToken', 'userRole']).then(([tok, role]) => {
      if (!tok[1])                       { setInitialRoute('Login'); }
      else if (role[1] === 'DRIVER')    { setInitialRoute('DriverMain'); }
      else if (role[1] === 'CUSTOMER')  { setInitialRoute('CustomerMain'); }
      else                              { setInitialRoute('Main'); }
      setReady(true);
    });
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a73e8' }}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login"        component={LoginScreen} />
      <Stack.Screen name="RegisterType" component={RegisterTypeScreen} />
      <Stack.Screen name="RegisterForm" component={RegisterFormScreen} />
      <Stack.Screen name="Main"         component={MainTabs} />
      <Stack.Screen name="DriverMain"   component={DriverTabs} />
      <Stack.Screen name="CustomerMain" component={CustomerTabs} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <AppNavigator />
      </NavigationContainer>
    </LanguageProvider>
  );
}
