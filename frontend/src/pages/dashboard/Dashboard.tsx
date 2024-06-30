import { useEffect, useState } from "react";
import { Modal, Card, Box, Grid, Dialog, DialogContent, DialogTitle, DialogActions, Button, Typography } from '@mui/material';
import Add from "../../components/addPost/Add";
import axios from "axios";
import { IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { getBaseURL } from '../../helpers/axios';
import "./style.scss"
import { CARD_BUTTON, CARD_HEADING, CARD_SUBHEADING } from "../../constants/CardMessages";

interface DashboardItem {
    title: string;
    uploaded_time: string;
    image: string;
    description: string;
    created_by: string;
}

export default function Dashboard() {
    const [selectedImage, setSelectedImage] = useState<DashboardItem | null>(null);
    const [open, setOpen] = useState(false);
    const [imageopen, setImageOpen] = useState(false);
    const [DashboardData, setDashboardData] = useState<DashboardItem[]>([]);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    
    const handleClickOpen = (item: DashboardItem) => {
        setSelectedImage(item);
        setImageOpen(true);
    };

    const handleClickClose = () => {
        setImageOpen(false);
        setSelectedImage(null);
    };

    const get_all_data_from_Dashboard = async () => {
        try {
            const response = await axios.get(`${getBaseURL()}/dashboard/get_gallery_images/`);
            console.log("data", response.data)
            setDashboardData(response.data);
        } catch (error) {
            console.log('error', error)
        }
    }

    useEffect(() => {
        get_all_data_from_Dashboard()
    }, [])

    return (
        <div
        style={{
            width: '100vw',
            minHeight: '100vh',
            margin: 0,
            padding: 0,
            overflowY: 'auto',    
            backgroundColor: '#F5F5F5',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
          }}
        >
            <Box sx={{width: '100%', position: 'relative', padding: '10px'}}>
                <Typography variant="body1" gutterBottom sx={{paddingTop:'10px', paddingBottom:'10px', fontFamily:'cursive', fontWeight:'5px', fontSize:'20px', textAlign: 'center'}}>
                    {CARD_HEADING.WELCOME}
                </Typography>
                <Box sx={{ 
                position: 'absolute',
                top: 10,
                right: 40,
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
                }}>
                    <Button
                        variant="outlined"
                        onClick={() => {
                            window.location.href = "/login";
                        }}
                    >
                        {CARD_BUTTON.LOGIN}
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => {
                            window.location.href = "/register";
                        }}
                    >
                        {CARD_BUTTON.REGISTER}
                    </Button>
                    <IconButton 
                        size="large"
                        onClick={handleOpen} 
                        color="primary"
                    >
                        <AddIcon className={`${open ? 'rotate' : ''}`} />
                    </IconButton>
                </Box>
            </Box>
            <Box sx={{ width: '100%', borderBottom: '2px solid black', marginTop: '10px' }}></Box>
            <Modal open={open} onClose={handleClose}>
                <div>
                    <Card sx={{
                        position: 'absolute', top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        maxWidth: 700,
                        maxHeight: 700,
                        bgcolor: 'background.paper',
                        backgroundColor: '#F5F5F5', 
                        boxShadow: 24,
                        p: 4,
                        borderRadius: 2
                    }}>
                        <Add handleClose={handleClose} />
                    </Card>
                </div>
            </Modal>
            
            <Grid container spacing={1} sx={{ marginTop: '50px', justifyContent: 'center', overflowY: 'auto', height: '92vh' }}>
                {DashboardData.map((item, index) => (
                    <Grid item key={index} sx={{ flex: '1 0 18%', maxWidth: '370px', height: '450px' }}>
                        <Card sx={{ height: '100%', width: '100%' }} onClick={() => handleClickOpen(item)}>
                            <img src={`${getBaseURL}${item.image}`} alt={`Image ${index}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Dialog open={imageopen} onClose={handleClickClose} maxWidth="lg" fullWidth sx={{backgroundColor: '#FFFDD0'}}>
                <Box sx={{backgroundColor: '#FFFDD0'}}>
                    {selectedImage && (
                        <>
                            <DialogTitle
                                sx={{
                                fontWeight: 'bold',
                                textAlign: 'center',
                                color: 'black',
                                padding: '26px 24px',
                                paddingBottom:'30px',
                                paddingTop:'30px',
                                }}
                                >
                                {selectedImage.title}
                            </DialogTitle>
                            <DialogContent
                                sx={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '24px',
                                color: 'black',
                                padding: '24px',
                                paddingTop: '30px'
                                }}
                            >
                                <div>
                                <img
                                    src={`${getBaseURL()}${selectedImage.image}`}
                                    alt="Selected"
                                    style={{
                                    width: '100%',
                                    height: '90%',
                                    border: '1px solid #fff',
                                    borderRadius: '4px',
                                    }}
                                />
                                </div>
                                <div>
                                <Typography variant="body1" gutterBottom sx={{ whiteSpace: 'break-spaces' }}>
                                    {selectedImage.description}
                                </Typography>
                                <div style={{ flex: '1', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                    <Typography variant="body2" gutterBottom>
                                        <strong>__</strong> {selectedImage.created_by}
                                    </Typography>
                                    <Typography variant="body2" gutterBottom>
                                        <i>{CARD_SUBHEADING.INSTAGRAM_PAGE_NAME}</i>
                                    </Typography>
                                    <Typography variant="body2" gutterBottom>
                                    <i>{CARD_SUBHEADING.UPLOADED_AT}:{selectedImage.uploaded_time}</i>
                                    </Typography>
                                    </div>
                                </div>
                            </DialogContent>
                            <DialogActions
                                sx={{
                                color: 'black',
                                padding: '16px 14px',
                                }}
                            >
                                <Button onClick={handleClickClose} color="primary">
                                {CARD_BUTTON.CLOSE}
                                </Button>
                            </DialogActions>
                            </>
                    )}
                </Box>
            </Dialog>
        </div>
    );
}
