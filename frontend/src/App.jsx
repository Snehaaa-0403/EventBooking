import { useState } from 'react';
import './App.css';
import Home from './pages/Home.jsx';
import NavBar from './components/NavBar.jsx';
import { BrowserRouter,Routes,Route} from 'react-router-dom';
import AuthSignUp from './pages/AuthSignUp.jsx';
import AuthLogin from './pages/AuthLogin.jsx';
import EventHost from './pages/EventHost.jsx';
import OrganizerRoute from './components/OrganizerRoute.jsx';
import OrganizerDashboard from './pages/OrganizerDashBoard.jsx';
import BrowseEvents from './pages/BrowseEvents.jsx';
import  BookEvent  from './pages/BookEvent.jsx';
import UserDashboard from './pages/UserDashboard.jsx';


function App() {
  const [count, setCount] = useState(0)

  return (
    <BrowserRouter>
      <NavBar/>
      <Routes>
        <Route path="/signUp" element={<AuthSignUp role="User"/>}/>
        <Route path="/organizer/signUp" element={<AuthSignUp role="Organizer"/>}/>
        <Route path="/login" element={<AuthLogin/> }/>
        <Route path="/" element={<Home/>}/>
        <Route path="/organizer/hostEvent" element={
                                                    <OrganizerRoute>
                                                      <EventHost/>
                                                    </OrganizerRoute>  
                                                    }/>
        <Route path="/organizer/dashboard" element={
                                                  <OrganizerRoute>
                                                    <OrganizerDashboard/>
                                                  </OrganizerRoute>
                                                }/>
        <Route path="/events" element={
                                    <BrowseEvents/> 
                                }/>
        // Backend will check before booking seats if user is verified or not
        <Route path="/event/book-ticket/:eventID" element={<BookEvent/>}/>
        <Route path="/user/dashboard" element={<UserDashboard/>}/> 
      </Routes>
    </BrowserRouter>
  )
}

export default App

