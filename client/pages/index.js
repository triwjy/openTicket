import buildClient from '../api/build-client';
import React from 'react'

const LandingPage = ({ currentUser }) => {
  console.log(currentUser);
  return (
    <div>
    {currentUser ? <h3>You are signed in</h3> 
                 : <h3>Your are not signed in</h3> }
    </div>
  )
}

// executed first in ssr before rendering html (specific to next)
// can do fetch data here
LandingPage.getInitialProps = async context => {
  const client = buildClient(context)
  const { data } = await client.get('/api/users/currentuser'); 

  return data
};

export default LandingPage;
