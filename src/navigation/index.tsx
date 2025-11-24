import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import ChatListScreen from '../screens/ChatListScreen';
import ArchivedScreen from '../screens/ArchivedScreen';
import ChatScreen from '../screens/ChatScreen';
import { ChatStackParamList, RootTabParamList } from './navigationTypes';

const Tab = createBottomTabNavigator<RootTabParamList>();
const ChatStack = createStackNavigator<ChatStackParamList>();

// Stack Navigator for ChatList -> ChatScreen
function ChatStackNavigator() {
  return (
    <ChatStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#6200ee',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <ChatStack.Screen
        name="ChatList"
        component={ChatListScreen}
        options={{ title: 'Chats' }}
      />
      <ChatStack.Screen
        name="ChatScreen"
        component={ChatScreen}
        options={{
          headerShown: false,
        }}
      />
    </ChatStack.Navigator>
  );
}

// Main Tab Navigator
export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Chats') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Archived') {
            iconName = focused ? 'archive' : 'archive-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6200ee',
        tabBarInactiveTintColor: '#gray',
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Chats"
        component={ChatStackNavigator}
        options={{
          tabBarLabel: 'Chats',
        }}
      />
      <Tab.Screen
        name="Archived"
        component={ArchivedScreen}
        options={{
          tabBarLabel: 'Archived',
        }}
      />
    </Tab.Navigator>
  );
}

