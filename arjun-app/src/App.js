import './App.css';
import Home from './pages/Home';
import Login from './pages/Login';
import SignUp from './pages/SignUp';

function App() {
  // Simple routing based on URL path
  const path = window.location.pathname;
  
  let PageComponent = Home;
  if (path === '/login') {
    PageComponent = Login;
  } else if (path === '/signup') {
    PageComponent = SignUp;
  }

  return (
    <div className="App">
      <PageComponent />
    </div>
  );
}

export default App;
