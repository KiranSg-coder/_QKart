import Register from "./components/Register";
import ipConfig from "./ipConfig.json";
import Product from "./components/Products";
import Login from "./components/Login";
import { Switch, Route, Link } from "react-router-dom";
import Checkout from "./components/Checkout";
import Thanks from "./components/Thanks";

export const config = {
  endpoint: `https://qkart-frontend-h1zz.onrender.com/api/v1`,
};

function App() {
  return (
    <div className="App">
      <Switch>
        <Route path="/register">
          <Register />
        </Route>

        <Route path="/login">
          <Login />
        </Route>

        <Route path="/checkout">
          <Checkout />
        </Route>

        <Route path="/thanks">
          <Thanks />
        </Route>

        <Route path="/">
          <Product />
        </Route>
      </Switch>
    </div>
  );
}

export default App;

