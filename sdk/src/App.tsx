import { MemoryRouter } from 'react-router-dom';

import Playground from './ui/pages/playground';
import { ApiProvider } from './ui/app/api';
import { LocalizationProvider } from './ui/app/providers/localization';

function App() {
  return (
    <ApiProvider>
      <LocalizationProvider>
        <MemoryRouter initialEntries={['/']}>
          <Playground />
        </MemoryRouter>
      </LocalizationProvider>
    </ApiProvider>
  );
}

export default App;
