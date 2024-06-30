import { useState, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { Box, Grid, TextField, InputAdornment, Button, Link, Card, CardContent, Typography } from '@mui/material';
import { AccountCircle as AccountCircleIcon, Email as EmailIcon, Lock as LockIcon } from '@mui/icons-material';
import { getBaseURL } from '../../helpers/axios';
import { CARD_ALERT, CARD_BUTTON, CARD_SUBHEADING } from '../../constants/CardMessages';

const Register = () => {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);
    const [formData, setFormData] = useState({
        tenant_name: '',
        email: '',
        password1: '',
        password2: ''
    });

    const handleSnackbarClose = () => {
        setOpen(false);
        navigate(`/activate/${formData.email}`);
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleLogin = () => {
        navigate("/login")
    }

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const data = {
            tenant_name: formData.tenant_name,
            email: formData.email,
            password1: formData.password1,
            password2: formData.password2
        };

        axios
          .post(`${getBaseURL()}/api/register/`, data)
          .then((res) => {
            if(res.data.success){
                setOpen(true);
            }
            console.log(res.data.success)
            localStorage.setItem("auth", JSON.stringify({
                access: res.data.access,
                refresh: res.data.refresh,
                user: res.data.user,
            }));
          })
          .catch((err) => {
            if (err.response) {
                const errors = err.response.data.error;
                if (Array.isArray(errors)) {
                    setErrors(errors);
                } else {
                    setErrors([errors]);
                }    
            }
          });
    };

    return (
        <Box 
            sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '95vh' 
            }}
        >
            <Grid 
                container 
                spacing={2} 
                sx={{ 
                    display: 'flex', 
                    justifyContent: 'center' 
                }}
            >
                <Grid item lg={3} md={6} xs={8}>
                    <Card >
                        <CardContent>
                            <Box 
                                sx={{ 
                                    display: 'flex', 
                                    justifyContent: 'center', 
                                    marginBottom: '1rem', 
                                }}
                            >
                                <Box 
                                    sx={{ 
                                        backgroundColor: 'rgba(65, 147, 169, 0.4)', 
                                        padding: '0.5rem', 
                                        borderRadius: '50%' 
                                    }}
                                >
                                    <img 
                                        width="60" 
                                        height="60" 
                                        src="https://img.icons8.com/?size=100&id=aOMbf5k97bfk&format=png&color=000000" 
                                        alt="user" 
                                    />
                                </Box>
                            </Box>
                            <form onSubmit={handleSubmit}>
                                <Box sx={{ marginBottom: '1rem' }}>
                                    <TextField
                                        label="Tenant Name"
                                        variant="outlined"
                                        fullWidth
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <AccountCircleIcon />
                                                </InputAdornment>
                                            ),
                                        }}
                                        name="tenant_name"
                                        value={formData.tenant_name}
                                        onChange={handleChange}
                                    />
                                </Box>
                                <Box sx={{ marginBottom: '1rem' }}>
                                    <TextField
                                        label="Email"
                                        variant="outlined"
                                        fullWidth
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <EmailIcon />
                                                </InputAdornment>
                                            ),
                                        }}
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </Box>
                                <Box sx={{ marginBottom: '1rem' }}>
                                    <TextField
                                        label="Password"
                                        type="password"
                                        variant="outlined"
                                        fullWidth
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <LockIcon />
                                                </InputAdornment>
                                            ),
                                        }}
                                        name="password1"
                                        value={formData.password1}
                                        onChange={handleChange}
                                    />
                                </Box>
                                <Box sx={{ marginBottom: '1rem' }}>
                                    <TextField
                                        label="Confirm Password"
                                        type="password"
                                        variant="outlined"
                                        fullWidth
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <LockIcon />
                                                </InputAdornment>
                                            ),
                                        }}
                                        name="password2"
                                        value={formData.password2}
                                        onChange={handleChange}
                                    />
                                </Box>
                                
                                <Box 
                                    sx={{ 
                                        display: 'flex', 
                                        justifyContent: 'center', 
                                        marginBottom: '1rem' 
                                    }}
                                >
                                    <Button 
                                        type="submit" 
                                        variant='contained' 
                                        sx={{ 
                                            backgroundColor:'#4465B7',
                                            width: '80%', 
                                            '&:hover': {
                                                backgroundColor: '#0E4491',
                                                color: 'white',
                                            } 
                                        }}
                                    >
                                        {CARD_BUTTON.REGISTER}
                                    </Button>
                                </Box>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="body2">
                                        {CARD_SUBHEADING.ALREADY_HAVE_ACCOUNT}{' '}
                                        <Link 
                                            onClick={handleLogin} 
                                            sx={{ 
                                                textDecoration: 'none', 
                                                cursor: 'pointer' 
                                            }}
                                        >
                                            {CARD_BUTTON.LOGIN}
                                        </Link>
                                    </Typography>
                                </Box>
                            </form>
                            {errors.length > 0 && (
                                <Box sx={{ textAlign: 'center', marginTop: '1rem' }}>
                                    <ul style={{ listStyleType: 'none', padding: 0 }}>
                                        {errors.map((errorMessage, index) => (
                                            <li key={index} style={{ color: 'red', fontStyle: 'italic' }}>
                                                {errorMessage}
                                            </li>
                                        ))}
                                    </ul>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                    <Snackbar
                        open={open}
                        autoHideDuration={6000} 
                        onClose={handleSnackbarClose}
                        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                    >
                        <MuiAlert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
                            {CARD_ALERT.REGISTRATION_SUCCESSFULL}
                        </MuiAlert>
                    </Snackbar>
                </Grid>
            </Grid>
        </Box>
    );
};
export default Register;
