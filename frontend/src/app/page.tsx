'use client';

import { useState } from 'react';
import axios from 'axios';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  CircularProgress,
  Fade,
  List,
  ListItem,
  Chip,
  Divider,
  Tooltip
} from '@mui/material';
import {
  Search,
  AutoAwesome,
  FactCheck,
  History,
  ErrorOutline,
  Timeline,
  Terminal,
  IntegrationInstructions,
  Troubleshoot,
  Summarize,
  Gavel,
  Storage
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import ContextManager from '../components/ContextManager';
import ResearchPipeline from '../components/ResearchPipeline';

interface TraceStep {
  node: string;
  output: any;
  timestamp: string;
}

export default function Home() {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    answer: string;
    trace: TraceStep[];
    queryId: string;
  } | null>(null);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setResult(null);
    setError('');

    try {
      // Use EventSource for real-time streaming
      const url = `http://localhost:3001/research/ask-live?question=${encodeURIComponent(question)}`;
      const eventSource = new EventSource(url);

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === 'trace') {
          setResult(prev => ({
            answer: prev?.answer || '',
            queryId: prev?.queryId || '...',
            trace: [...(prev?.trace || []), data.payload]
          }));
        } else if (data.type === 'complete') {
          setResult(prev => ({
            answer: data.payload.finalAnswer,
            queryId: data.payload.queryId,
            trace: prev?.trace || []
          }));
          setLoading(false);
          eventSource.close();
        }
      };

      eventSource.onerror = (err) => {
        setError('Streaming connection lost. Please check the backend.');
        setLoading(false);
        eventSource.close();
      };

    } catch (err) {
      setError('Connection failed. Please check if the backend is running on port 3001.');
      console.error(err);
      setLoading(false);
    }
  };

  const getNodeIcon = (node: string) => {
    const n = node.toLowerCase();
    if (n.includes('splitter')) return <IntegrationInstructions sx={{ color: '#38bdf8' }} />;
    if (n.includes('finder')) return <Troubleshoot sx={{ color: '#818cf8' }} />;
    if (n.includes('ranker')) return <Storage sx={{ color: '#fbbf24' }} />;
    if (n.includes('summarizer')) return <Summarize sx={{ color: '#34d399' }} />;
    if (n.includes('checker')) return <Gavel sx={{ color: '#f87171' }} />;
    return <Terminal sx={{ color: '#94a3b8' }} />;
  };

  return (
    <Box sx={{ minHeight: '100vh', pb: 8, pt: 8 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 10 }}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Chip
              label="Platform v1.0"
              size="small"
              sx={{
                mb: 3,
                bgcolor: 'rgba(56, 189, 248, 0.1)',
                color: 'primary.main',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                fontWeight: 600,
                fontSize: '0.75rem',
                letterSpacing: '0.05em'
              }}
            />
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '3rem', md: '5rem' },
                mb: 2,
                background: 'linear-gradient(to bottom, #fff, #94a3b8)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Agentic<Box component="span" sx={{ color: 'primary.main' }}>.</Box>Research
            </Typography>
            <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 400, maxWidth: 600, mx: 'auto' }}>
              Deploy a specialized team of AI agents to decompose, search, and synthesize complex research queries in seconds.
            </Typography>
          </motion.div>
        </Box>

        {/* Search Input Card */}
        <Paper
          elevation={0}
          sx={{
            p: 1.5,
            mb: 10,
            maxWidth: 700,
            mx: 'auto',
            bgcolor: 'rgba(30, 41, 59, 0.4)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            '&:hover': {
              borderColor: 'primary.main',
              boxShadow: '0 0 20px rgba(56, 189, 248, 0.1)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          <TextField
            fullWidth
            variant="standard"
            placeholder="Search objectives, e.g. SQL vs NoSQL vs GraphQL..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            InputProps={{
              disableUnderline: true,
              sx: { px: 2, py: 1, fontSize: '1.2rem' }
            }}
          />
          <Button
            variant="contained"
            disableElevation
            onClick={handleSearch}
            disabled={loading}
            sx={{
              height: 56,
              minWidth: 140,
              bgcolor: 'primary.main',
              '&:hover': { bgcolor: 'primary.dark' }
            }}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Search />}
          >
            {loading ? 'Processing' : 'Analyze'}
          </Button>
        </Paper>

        {/* Pipeline Interface */}
        <Box sx={{ maxWidth: 900, mx: 'auto', mb: 6 }}>
          <ResearchPipeline
            activeNodes={result?.trace.map(t => t.node) || []}
            isStreamActive={loading}
          />
        </Box>

        {error && (
          <Fade in={!!error}>
            <Box sx={{ maxWidth: 700, mx: 'auto', mb: 6 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  bgcolor: 'rgba(248, 113, 113, 0.1)',
                  border: '1px solid rgba(248, 113, 113, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  color: 'error.main',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <ErrorOutline sx={{ fontSize: 28 }} />
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>Connection Error</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>{error}</Typography>
                </Box>
              </Paper>
            </Box>
          </Fade>
        )}

        {/* Main Interface */}
        <Box sx={{ width: '100%' }}>
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Paper sx={{ p: 10, textAlign: 'center', bgcolor: 'transparent', minHeight: 400, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <Box sx={{ position: 'relative', mb: 4 }}>
                    <CircularProgress size={80} thickness={2} sx={{ color: 'primary.main' }} />
                    <AutoAwesome sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'primary.main', fontSize: 32 }} />
                  </Box>
                  <Typography variant="h5" sx={{ mb: 1, fontWeight: 700 }}>Kernel Initializing</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>Spawning specialized agents for data aggregation...</Typography>
                </Paper>
              </motion.div>
            ) : result ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    overflow: 'hidden',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                    border: '1px solid rgba(56, 189, 248, 0.2)',
                    background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(30, 41, 59, 0.7) 100%)',
                    backdropFilter: 'blur(10px)',
                    maxWidth: 900,
                    mx: 'auto'
                  }}
                >
                  <Box sx={{ px: 4, py: 3, bgcolor: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <FactCheck sx={{ color: 'success.main' }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Consolidated Intelligence</Typography>
                    </Box>
                    <Chip
                      label={`ID: ${result.queryId.slice(0, 8)}`}
                      size="small"
                      sx={{
                        bgcolor: 'rgba(56, 189, 248, 0.1)',
                        color: 'primary.main',
                        fontFamily: 'monospace',
                        fontSize: '0.7rem',
                        border: '1px solid rgba(56, 189, 248, 0.3)'
                      }}
                    />
                  </Box>
                  <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.05)' }} />
                  <Box sx={{ p: 5 }}>
                    <Box sx={{ '& p': { mb: 3, lineHeight: 1.8, fontSize: '1.1rem', color: 'text.secondary' } }}>
                      {result.answer.split('\n').filter(l => l.trim()).map((p, i) => (
                        <Typography key={i} paragraph>{p}</Typography>
                      ))}
                    </Box>
                  </Box>
                </Paper>
              </motion.div>
            ) : (
              <Box sx={{ height: 300, maxWidth: 900, mx: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.2, border: '2px dashed #334155', borderRadius: 8 }}>
                <History sx={{ fontSize: 64, mb: 2 }} />
                <Typography>Awaiting kernel objective</Typography>
              </Box>
            )}
          </AnimatePresence>
        </Box>

        {/* Footer */}
        <Box sx={{ mt: 12, textAlign: 'center', opacity: 0.6 }}>
          <Divider sx={{ mb: 4, borderColor: 'rgba(255, 255, 255, 0.05)' }} />
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Powered by Material UI
            </Typography>
            <Chip
              label="1 Issue"
              size="small"
              color="error"
              icon={<ErrorOutline sx={{ fontSize: 14 }} />}
              sx={{
                height: 20,
                fontSize: '0.65rem',
                fontWeight: 600
              }}
            />
          </Box>
        </Box>
      </Container>
      <ContextManager />
    </Box>
  );
}
