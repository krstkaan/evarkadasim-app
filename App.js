import React from 'react';
import { Provider } from 'react-redux';
import store from './src/store';
import RootNavigation from './src/navigation/RootNavigation';

export default function App() {
  return (
    <Provider store={store}>
      <RootNavigation />
    </Provider>
  );
}
