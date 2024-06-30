import { useState } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Box, Grid, TextField, InputAdornment, Button, Link, Card, CardContent } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import { getBaseURL } from "../../helpers/axios";
import { CARD_BUTTON, CARD_SUBHEADING } from '../../constants/CardMessages';

const VerifyAccount = () => {
  const navigate = useNavigate();
  const { email } = useParams();
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: email,
    password: '',
    otp: ''
  });

  const handleSubmit = (event: { preventDefault: () => void; }) => {
    event.preventDefault();
    const data ={
        email: formData.email,
        password: formData.password,
        otp: formData.otp
    }
    axios
      .post(`${getBaseURL()}/api/activate/`, data)
      .then((res) => {
        // Registering the account and tokens in the store
        localStorage.setItem("auth", JSON.stringify({
            access: res.data.access,
            refresh: res.data.refresh,
            user: res.data.user,
        }));
        navigate("/");
      })
      .catch((err) => {
        //TODO: show error to user
        console.log(err.request.response);
        if (err.message) {
          setError(err.request.response);
        }
      });
  }

  const goToLoginPage = () => {
    navigate("/login");
  }

  return (
    <Box style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '95vh' }}>
        <Grid container spacing={2} style={{ display: 'flex', justifyContent: 'center' }}>
            <Grid item lg={3} md={6} xs={8}>
                <Card variant="outlined">
                    <CardContent style={{ textAlign: 'center' }}>
                        <div style={{ marginBottom: '1rem' }}>
                            <img width="60" height="60" src="https://img.icons8.com/color/96/user.png" alt="user" />
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <TextField
                                label="Email"
                                required
                                variant="outlined"
                                style={{ width: '100%' }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <EmailIcon />
                                        </InputAdornment>
                                    ),
                                }}
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <TextField
                                label="Password"
                                type="password"
                                required
                                variant="outlined"
                                style={{ width: '100%' }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LockIcon />
                                        </InputAdornment>
                                    ),
                                }}
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <TextField
                                label="OTP"
                                required
                                variant="outlined"
                                style={{ width: '100%' }}
                                value={formData.otp}
                                onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                            />
                        </div>

                        {error &&
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', color: 'red' }}>Invalid credentials!</div>
                        }
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                            <Button 
                                onClick={handleSubmit} 
                                variant='contained' 
                                color='primary' 
                                sx={{ 
                                    backgroundColor:'#4465B7',
                                    width: '80%', 
                                    '&:hover': {
                                        backgroundColor: '#0E4491',
                                        color: 'white',
                                    } 
                                    }}>
                                {CARD_BUTTON.ACTIVATE}
                            </Button>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                            {CARD_SUBHEADING.ALREADY_HAVE_ACCOUNT} &nbsp;
                            <Link onClick={goToLoginPage} style={{ textDecoration: 'none', cursor: 'pointer' }}>Login</Link>
                        </div>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    </Box>

  )
}

export default VerifyAccount;