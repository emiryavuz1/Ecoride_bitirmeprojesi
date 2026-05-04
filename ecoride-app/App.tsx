import { AppContextProvider } from './src/context/AppContext';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  return (
    <AppContextProvider>
      <AppNavigator />
    </AppContextProvider>
  );
}
