'use client'

import { useState, useEffect } from 'react'
import { Box, Text, Button, Spinner, Alert, AlertIcon, Code } from '@chakra-ui/react'

export default function ApiConnectionTest() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState<string>('')
  const [apiUrl, setApiUrl] = useState<string>('')

  useEffect(() => {
    // Get the API URL from environment variables
    setApiUrl(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000')
  }, [])

  const testConnection = async () => {
    setStatus('loading')
    try {
      const response = await fetch(`${apiUrl}/api/health`)
      
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`)
      }
      
      const data = await response.json()
      setMessage(data.message || 'API is working!')
      setStatus('success')
    } catch (error) {
      console.error('API connection error:', error)
      setMessage(error instanceof Error ? error.message : 'Unknown error occurred')
      setStatus('error')
    }
  }

  return (
    <Box p={4} borderWidth={1} borderRadius="md" shadow="sm">
      <Text fontSize="lg" fontWeight="bold" mb={2}>
        API Connection Test
      </Text>
      
      <Text mb={4}>
        Testing connection to: <Code>{apiUrl}</Code>
      </Text>

      <Button 
        onClick={testConnection} 
        colorScheme="blue" 
        isLoading={status === 'loading'}
        mb={4}
      >
        Test Connection
      </Button>

      {status === 'loading' && (
        <Box textAlign="center" my={4}>
          <Spinner size="md" />
          <Text mt={2}>Testing connection...</Text>
        </Box>
      )}

      {status === 'success' && (
        <Alert status="success" borderRadius="md">
          <AlertIcon />
          {message}
        </Alert>
      )}

      {status === 'error' && (
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          Connection failed: {message}
        </Alert>
      )}
    </Box>
  )
} 