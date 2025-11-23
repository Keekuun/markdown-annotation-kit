import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import TestCaseApp from './TestCaseApp';
import './index.css';

// 通过 URL 参数切换测试用例
// 访问 http://localhost:3000?test=true 查看测试用例
const urlParams = new URLSearchParams(window.location.search);
const useTestCase = urlParams.get('test') === 'true';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {useTestCase ? <TestCaseApp /> : <App />}
  </React.StrictMode>
);

