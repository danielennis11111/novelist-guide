'use client'

import { useEffect, useState } from 'react'
import {
  Box,
  Container,
  Heading,
  Button,
  SimpleGrid,
  Card,
  CardBody,
  Text,
  VStack,
  HStack,
  Tag,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  useToast,
} from '@chakra-ui/react'
import { FiPlus, FiBook } from 'react-icons/fi'
import { useSession } from 'next-auth/react'
import { Novel } from '@/types/novel'
import Link from 'next/link'
import ApiConnectionTest from '@/components/ApiConnectionTest'

export default function Home() {
  const { data: session } = useSession()
  const [novels, setNovels] = useState<Novel[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [newNovel, setNewNovel] = useState({
    title: '',
    description: '',
    targetAudience: 'adult',
    genre: [] as string[],
  })
  const toast = useToast()

  useEffect(() => {
    const loadNovels = async () => {
      if (!session) return;
      
      try {
        setIsLoading(true);
        const response = await fetch('/api/novels')
        if (!response.ok) {
          throw new Error('Failed to load novels')
        }
        const data = await response.json()
        setNovels(data)
      } catch (error) {
        console.error('Error loading novels:', error);
        toast({
          title: 'Error loading novels',
          description: error instanceof Error ? error.message : 'An error occurred',
          status: 'error',
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (session) {
      loadNovels()
    } else {
      setIsLoading(false);
    }
  }, [session, toast])

  const handleCreateNovel = async () => {
    try {
      const response = await fetch('/api/novels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newNovel),
      })

      if (!response.ok) {
        throw new Error('Failed to create novel')
      }

      const novel = await response.json()
      setNovels((prev) => [...prev, novel])
      setNewNovel({
        title: '',
        description: '',
        targetAudience: 'adult',
        genre: [],
      })
      onClose()

      toast({
        title: 'Novel Created',
        description: 'Your new novel has been created successfully.',
        status: 'success',
      })
    } catch (error) {
      console.error('Error creating novel:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create novel',
        status: 'error',
      })
    }
  }

  return (
    <div className="relative isolate overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-32 lg:flex lg:px-8 lg:py-40">
        <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl lg:flex-shrink-0 lg:pt-8">
          <h1 className="mt-10 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Write Your Novel with Your Younger Self as Guide
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Novelist Guide is your personal writing companion that helps you develop your story while ensuring you remain the true author. Connect with a version of your younger self who shares your love for writing and favorite authors.
          </p>
          <div className="mt-10 flex items-center gap-x-6">
            {session ? (
              <Link
                href="/novels"
                className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                View My Novels
              </Link>
            ) : (
              <Link
                href="/auth/signin"
                className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Get Started
              </Link>
            )}
            <Link
              href="/about"
              className="text-sm font-semibold leading-6 text-gray-900"
            >
              Learn more <span aria-hidden="true">→</span>
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2">
            <div className="border-l-2 border-indigo-600 pl-6">
              <h3 className="text-base font-semibold text-gray-900">Your Story, Your Voice</h3>
              <p className="mt-2 text-sm text-gray-600">
                We never write for you. Instead, we help you develop your ideas, characters, and world while maintaining your unique voice.
              </p>
            </div>
            <div className="border-l-2 border-indigo-600 pl-6">
              <h3 className="text-base font-semibold text-gray-900">Google Drive Integration</h3>
              <p className="mt-2 text-sm text-gray-600">
                Your work is automatically saved and synced with Google Drive, making it easy to access and share when you're ready.
              </p>
            </div>
            <div className="border-l-2 border-indigo-600 pl-6">
              <h3 className="text-base font-semibold text-gray-900">World Bible Builder</h3>
              <p className="mt-2 text-sm text-gray-600">
                Create and maintain a detailed world bible with character relationships, locations, and plot elements.
              </p>
            </div>
            <div className="border-l-2 border-indigo-600 pl-6">
              <h3 className="text-base font-semibold text-gray-900">Writing Style Analysis</h3>
              <p className="mt-2 text-sm text-gray-600">
                Get insights and suggestions based on your favorite authors while developing your own unique style.
              </p>
            </div>
          </div>
          
          {/* API Connection Test */}
          <div className="mt-12">
            <ApiConnectionTest />
          </div>
        </div>
      </div>
    </div>
  )
} 