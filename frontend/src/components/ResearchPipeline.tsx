'use client';

import React from 'react';
import { Box, Typography, Stack, useTheme } from '@mui/material';
import { AccessTime, FiberManualRecord } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

interface PipelineStep {
    id: string;
    label: string;
    nodeMatch: string[];
}

const steps: PipelineStep[] = [
    { id: 'DECONSTRUCT', label: 'DECONSTRUCT', nodeMatch: ['splitter'] },
    { id: 'RETRIEVE', label: 'RETRIEVE', nodeMatch: ['finder'] },
    { id: 'RANK', label: 'RANK', nodeMatch: ['ranker'] },
    { id: 'SYNTHESIZE', label: 'SYNTHESIZE', nodeMatch: ['summarizer'] },
    { id: 'AUDIT', label: 'AUDIT', nodeMatch: ['checker', 'cross-checker'] },
    { id: 'REPORT', label: 'REPORT', nodeMatch: ['final answer maker', 'final_answer'] },
];

interface ResearchPipelineProps {
    activeNodes: string[];
    isStreamActive?: boolean;
}

export default function ResearchPipeline({ activeNodes, isStreamActive }: ResearchPipelineProps) {
    const theme = useTheme();

    // Find the current active step index based on the last node that executed
    const lastNode = activeNodes.length > 0 ? activeNodes[activeNodes.length - 1].toLowerCase() : null;
    const currentStepIndex = steps.findIndex(step =>
        step.nodeMatch.some(match => lastNode?.includes(match))
    );

    return (
        <Box
            sx={{
                width: '100%',
                p: 3,
                bgcolor: 'rgba(15, 23, 42, 0.6)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: 4,
                position: 'relative',
                overflow: 'hidden',
                mb: 4
            }}
        >
            {/* Header Area */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 6 }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box
                        sx={{
                            p: 0.8,
                            bgcolor: 'rgba(255, 255, 255, 0.03)',
                            borderRadius: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid rgba(255, 255, 255, 0.05)'
                        }}
                    >
                        <AccessTime sx={{ fontSize: 18, color: 'text.secondary' }} />
                    </Box>
                    <Typography
                        variant="overline"
                        sx={{
                            fontWeight: 700,
                            letterSpacing: '0.15em',
                            color: 'text.secondary',
                            fontSize: '0.7rem'
                        }}
                    >
                        NEURAL RESEARCH PIPELINE
                    </Typography>
                </Stack>

                <Box
                    sx={{
                        px: 1.5,
                        py: 0.5,
                        bgcolor: 'rgba(0, 0, 0, 0.3)',
                        borderRadius: 10,
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                    }}
                >
                    <motion.div
                        animate={{ opacity: isStreamActive ? [1, 0.4, 1] : 1 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <FiberManualRecord sx={{ fontSize: 10, color: isStreamActive ? '#10b981' : 'text.disabled' }} />
                    </motion.div>
                    <Typography
                        sx={{
                            fontSize: '0.65rem',
                            fontWeight: 800,
                            color: isStreamActive ? '#10b981' : 'text.disabled',
                            letterSpacing: '0.05em'
                        }}
                    >
                        {isStreamActive ? 'STREAM ACTIVE' : 'PIPELINE READY'}
                    </Typography>
                </Box>
            </Stack>

            {/* Progress Line and Steps */}
            <Box sx={{ position: 'relative', px: 2 }}>
                {/* Background Line */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: 12,
                        left: '4%',
                        right: '4%',
                        height: '1px',
                        bgcolor: 'rgba(255, 255, 255, 0.05)',
                        zIndex: 0
                    }}
                />

                <Stack direction="row" justifyContent="space-between" sx={{ position: 'relative', zIndex: 1 }}>
                    {steps.map((step, index) => {
                        const isCompleted = index < currentStepIndex;
                        const isActive = index === currentStepIndex;
                        const isPending = index > currentStepIndex;

                        return (
                            <Stack key={step.id} spacing={2} alignItems="center" sx={{ width: 80 }}>
                                {/* Step Indicator */}
                                <Box sx={{ position: 'relative', width: 24, height: 24 }}>
                                    <AnimatePresence>
                                        {(isActive || isCompleted) && (
                                            <motion.div
                                                initial={{ scale: 0, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                transition={{ duration: 0.3 }}
                                                style={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    width: '100%',
                                                    height: '100%',
                                                    borderRadius: '50%',
                                                    backgroundColor: '#10b981',
                                                    filter: 'blur(8px)',
                                                    opacity: 0.3,
                                                }}
                                            />
                                        )}
                                    </AnimatePresence>

                                    <Box
                                        sx={{
                                            width: 24,
                                            height: 24,
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            bgcolor: isActive || isCompleted ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                                            border: `1px solid ${isActive || isCompleted ? '#10b981' : 'rgba(255, 255, 255, 0.1)'}`,
                                            transition: 'all 0.3s ease',
                                            position: 'relative',
                                            zIndex: 1
                                        }}
                                    >
                                        {isActive ? (
                                            <motion.div
                                                animate={{ scale: [1, 1.2, 1] }}
                                                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                                style={{
                                                    width: 8,
                                                    height: 8,
                                                    borderRadius: '50%',
                                                    backgroundColor: '#10b981'
                                                }}
                                            />
                                        ) : (
                                            <Box
                                                sx={{
                                                    width: 4,
                                                    height: 4,
                                                    borderRadius: '50%',
                                                    bgcolor: isCompleted ? '#10b981' : 'rgba(255, 255, 255, 0.2)'
                                                }}
                                            />
                                        )}
                                    </Box>
                                </Box>

                                {/* Label */}
                                <Typography
                                    sx={{
                                        fontSize: '0.6rem',
                                        fontWeight: 800,
                                        color: isActive || isCompleted ? '#fff' : 'text.disabled',
                                        letterSpacing: '0.05em',
                                        textAlign: 'center',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    {step.label}
                                </Typography>
                            </Stack>
                        );
                    })}
                </Stack>
            </Box>
        </Box>
    );
}
