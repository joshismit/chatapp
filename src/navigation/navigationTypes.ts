import { NavigatorScreenParams } from '@react-navigation/native';

export type RootTabParamList = {
  Chats: undefined;
  Archived: undefined;
};

export type ChatStackParamList = {
  ChatList: undefined;
  ChatScreen: {
    chatId: string;
    conversationId?: string;
    userName?: string;
  };
};

export type RootStackParamList = {
  Login: undefined;
  Success: undefined;
  MainTabs: NavigatorScreenParams<RootTabParamList>;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

