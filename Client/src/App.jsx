// import Navbar from './components/Navbar';
import TeamRegistrationForm from './components/TeamRegistrationForm';
import React, { useState } from 'react';
import Navbar from './components/Navbar';


function App() {
  const [isMember, setIsMember] = useState(false);

  return (
    <div className=' text-xl font-bold min-h-screen w-screen bg-dark-300' >
      <Navbar setIsMember={setIsMember} isMember={isMember} />
      <TeamRegistrationForm isMember={isMember} />
    </div>
  )
}

export default App
