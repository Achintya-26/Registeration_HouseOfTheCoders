// import Navbar from './components/Navbar';
import TeamRegistrationForm from './components/TeamRegistrationForm';
import React, { useState } from 'react';
import Navbar from './components/Navbar';


function App() {
  const [isMember, setIsMember] = useState(false);
  const [memberId, setMemberId] = useState("");

  // let memId = memberId;

  return (
    <div className=' relative text-xl font-bold min-h-screen w-screen bg-dark-300' >
      <Navbar setIsMember={setIsMember} isMember={isMember} memberId={memberId} setMemberId={setMemberId} />
      <TeamRegistrationForm isMember={isMember} memberId={memberId} />
    </div>
  )
}

export default App