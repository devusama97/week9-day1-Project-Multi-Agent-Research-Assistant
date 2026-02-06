'use client';

import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Tabs,
    Tab,
    TextField,
    Button,
    IconButton,
    Tooltip,
    CircularProgress,
    Snackbar,
    Alert,
    Fade,
    Stack,
    Divider,
} from '@mui/material';
import {
    Add,
    UploadFile,
    Close,
    CheckCircle,
    PostAdd,
    Description,
} from '@mui/icons-material';
import axios from 'axios';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`context-tabpanel-${index}`}
            aria-labelledby={`context-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

export default function ContextManager() {
    const [open, setOpen] = useState(false);
    const [tabValue, setTabValue] = useState(0);
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

    // Manual Form State
    const [manualForm, setManualForm] = useState({ title: '', topic: '', content: '' });

    // PDF Form State
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [pdfMeta, setPdfMeta] = useState({ title: '', topic: '' });

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const handleManualUpload = async () => {
        if (!manualForm.content || !manualForm.title) {
            setSnackbar({ open: true, message: 'Title and Content are required!', severity: 'error' });
            return;
        }
        setLoading(true);
        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            await axios.post(`${baseUrl}/research/upload`, [manualForm]);
            setSnackbar({ open: true, message: 'Document added successfully!', severity: 'success' });
            setManualForm({ title: '', topic: '', content: '' });
        } catch (err) {
            setSnackbar({ open: true, message: 'Failed to upload document.', severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handlePdfUpload = async () => {
        if (!selectedFile) {
            setSnackbar({ open: true, message: 'Please select a PDF file!', severity: 'error' });
            return;
        }
        setLoading(true);
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('title', pdfMeta.title || selectedFile.name);
        formData.append('topic', pdfMeta.topic || 'General');

        try {
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
            await axios.post(`${baseUrl}/research/upload-pdf`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setSnackbar({ open: true, message: 'PDF processed and added!', severity: 'success' });
            setSelectedFile(null);
            setPdfMeta({ title: '', topic: '' });
        } catch (err) {
            setSnackbar({ open: true, message: 'Failed to process PDF.', severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Box sx={{ position: 'fixed', bottom: 32, right: 32, zIndex: 1000 }}>
                {!open ? (
                    <Tooltip title="Add Knowledge Source" placement="left">
                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={() => setOpen(true)}
                            sx={{
                                width: 64,
                                height: 64,
                                borderRadius: '50%',
                                boxShadow: (theme) => `0 0 20px ${theme.palette.secondary.dark}66`,
                            }}
                        >
                            <Add fontSize="large" />
                        </Button>
                    </Tooltip>
                ) : (
                    <Fade in={open}>
                        <Paper
                            elevation={24}
                            sx={{
                                width: { xs: '90vw', sm: 450 },
                                maxHeight: '80vh',
                                display: 'flex',
                                flexDirection: 'column',
                                overflow: 'hidden',
                                border: '1px solid rgba(129, 140, 248, 0.3)',
                                background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)',
                                backdropFilter: 'blur(16px)',
                            }}
                        >
                            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: 'rgba(255,255,255,0.03)' }}>
                                <Typography variant="h6" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <PostAdd color="secondary" /> Knowledge Base
                                </Typography>
                                <IconButton onClick={() => setOpen(false)} size="small">
                                    <Close fontSize="small" />
                                </IconButton>
                            </Box>
                            <Divider sx={{ opacity: 0.1 }} />

                            <Tabs
                                value={tabValue}
                                onChange={handleTabChange}
                                variant="fullWidth"
                                textColor="secondary"
                                indicatorColor="secondary"
                                sx={{ bgcolor: 'rgba(0,0,0,0.1)' }}
                            >
                                <Tab icon={<Description fontSize="small" />} iconPosition="start" label="Manual" />
                                <Tab icon={<UploadFile fontSize="small" />} iconPosition="start" label="PDF" />
                            </Tabs>

                            <Box sx={{ flex: 1, overflowY: 'auto' }}>
                                <TabPanel value={tabValue} index={0}>
                                    <Stack spacing={3}>
                                        <TextField
                                            fullWidth
                                            label="Document Title"
                                            variant="outlined"
                                            size="small"
                                            placeholder="e.g. Q4 Growth Report"
                                            value={manualForm.title}
                                            onChange={(e) => setManualForm({ ...manualForm, title: e.target.value })}
                                        />
                                        <TextField
                                            fullWidth
                                            label="Topic / Category"
                                            variant="outlined"
                                            size="small"
                                            placeholder="e.g. Finance"
                                            value={manualForm.topic}
                                            onChange={(e) => setManualForm({ ...manualForm, topic: e.target.value })}
                                        />
                                        <TextField
                                            fullWidth
                                            label="Content"
                                            variant="outlined"
                                            multiline
                                            rows={6}
                                            placeholder="Paste your source text here..."
                                            value={manualForm.content}
                                            onChange={(e) => setManualForm({ ...manualForm, content: e.target.value })}
                                        />
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            color="secondary"
                                            onClick={handleManualUpload}
                                            disabled={loading}
                                            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckCircle />}
                                        >
                                            {loading ? 'Adding...' : 'Add Knowledge'}
                                        </Button>
                                    </Stack>
                                </TabPanel>

                                <TabPanel value={tabValue} index={1}>
                                    <Stack spacing={3}>
                                        <Box
                                            sx={{
                                                border: '2px dashed rgba(129, 140, 248, 0.3)',
                                                borderRadius: 2,
                                                p: 4,
                                                textAlign: 'center',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease',
                                                '&:hover': {
                                                    borderColor: 'secondary.main',
                                                    bgcolor: 'rgba(129, 140, 248, 0.05)',
                                                },
                                            }}
                                            component="label"
                                        >
                                            <input
                                                type="file"
                                                accept="application/pdf"
                                                hidden
                                                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                            />
                                            <UploadFile sx={{ fontSize: 48, color: selectedFile ? 'success.main' : 'text.secondary', mb: 1, opacity: 0.7 }} />
                                            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                                                {selectedFile ? selectedFile.name : 'Click to select PDF file'}
                                            </Typography>
                                        </Box>

                                        {selectedFile && (
                                            <Fade in={!!selectedFile}>
                                                <Stack spacing={2}>
                                                    <TextField
                                                        fullWidth
                                                        label="PDF Title Override"
                                                        variant="outlined"
                                                        size="small"
                                                        value={pdfMeta.title}
                                                        onChange={(e) => setPdfMeta({ ...pdfMeta, title: e.target.value })}
                                                    />
                                                    <TextField
                                                        fullWidth
                                                        label="Topic / Category"
                                                        variant="outlined"
                                                        size="small"
                                                        value={pdfMeta.topic}
                                                        onChange={(e) => setPdfMeta({ ...pdfMeta, topic: e.target.value })}
                                                    />
                                                </Stack>
                                            </Fade>
                                        )}

                                        <Button
                                            fullWidth
                                            variant="contained"
                                            color="secondary"
                                            onClick={handlePdfUpload}
                                            disabled={loading || !selectedFile}
                                            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <UploadFile />}
                                        >
                                            {loading ? 'Processing PDF...' : 'Upload & Parse PDF'}
                                        </Button>
                                    </Stack>
                                </TabPanel>
                            </Box>
                        </Paper>
                    </Fade>
                )}
            </Box>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{ width: '100%', borderRadius: 3 }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
}
