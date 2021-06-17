import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom'

import EntryPage from "./pages/EntryPage";
import GamePage from "./pages/GamePage";


function App() {
  return (
    <Router>
      <Route path='/' exact component={EntryPage} />
      <Route path='/game' exact component={GamePage} />
    </Router>

  );
}

export default App;