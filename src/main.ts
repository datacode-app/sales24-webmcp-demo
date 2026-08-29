import './styles.css';
import { renderApp, setWebMcpStatus } from './ui';
import { registerSales24Tools } from './webmcp';

const root = document.querySelector<HTMLDivElement>('#app');
if (!root) throw new Error('App root not found');

renderApp(root);

const modelContext = (document as Document & { modelContext?: Parameters<typeof registerSales24Tools>[0] }).modelContext;
registerSales24Tools(modelContext)
  .then((result) => setWebMcpStatus(result.mode))
  .catch((error) => {
    console.error('WebMCP registration failed', error);
    setWebMcpStatus('preview');
  });
