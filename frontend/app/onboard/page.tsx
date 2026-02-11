'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Check, ChevronRight, ChevronLeft, Upload, Loader2, Github, Linkedin, Briefcase, GraduationCap, X, Globe, Code, Trophy, Target, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import gsap from 'gsap'

// Types
type OnboardingData = {
    // Step 1: Identity & Academics
    input1_name: string
    input2_email: string
    input_password: string // New password field
    select1_branch: string
    select2_year: string
    input3_cgpa: string

    // Step 2: Digital Footprint
    input4_linkedin: string
    input5_github: string
    input6_portfolio: string

    // Step 3: Professional Assets
    file1_resume: File | null
    multi_skills: string[]
    input_other_skill: string // For the "Others" manual entry

    // Step 4: Project & Experience
    input7_project1_title: string
    textarea1_project1_desc: string
    input8_project2_title: string
    textarea2_project2_desc: string
    textarea3_internships: string
    textarea4_certifications: string

    // Step 5: Career Ambition
    multi_roles: string[]
    input9_target_companies: string
}

const steps = [
    { id: 1, title: 'Identity & Academics', icon: GraduationCap },
    { id: 2, title: 'Digital Footprint', icon: Globe },
    { id: 3, title: 'Professional Assets', icon: Code },
    { id: 4, title: 'Projects & Exp.', icon: Trophy },
    { id: 5, title: 'Career Ambition', icon: Target },
]

// Comprehensive list of skills, alphabetically sorted
const ALL_SKILLS = [
    '.NET', 'AWS', 'Android Development', 'Angular', 'Ansible', 'Arduino', 'Artificial Intelligence', 'Azure',
    'Bash', 'Big Data', 'Blockchain', 'Bootstrap', 'C', 'C#', 'C++', 'CSS', 'Cloud Computing',
    'Computer Vision', 'Cybersecurity', 'Django', 'Docker', 'Elasticsearch', 'Express.js', 'Figma',
    'Firebase', 'Flask', 'Flutter', 'Git', 'Go', 'Google Cloud Platform', 'GraphQL', 'HTML', 'Hadoop',
    'Hibernate', 'IOS Development', 'IoT', 'Java', 'JavaScript', 'Jenkins', 'Jira', 'Kafka', 'Kotlin',
    'Kubernetes', 'Linux', 'Machine Learning', 'Matlab', 'MongoDB', 'MySQL', 'NLP', 'Next.js', 'Node.js',
    'NoSQL', 'Oracle', 'PHP', 'Pandas', 'PostgreSQL', 'Power BI', 'Python', 'PyTorch', 'R', 'React Native',
    'React.js', 'Redis', 'Redux', 'Ruby', 'Rust', 'SAS', 'SQL', 'Scala', 'Scikit-learn', 'Selenium',
    'Shell Scripting', 'Spark', 'Spring Boot', 'Swift', 'Tableau', 'Tailwind CSS', 'TensorFlow',
    'Terraform', 'TypeScript', 'Unity', 'Vue.js', 'Web3', 'XML'
].sort()

const COMMON_ROLES = ['Software Engineer', 'Data Scientist', 'Product Manager', 'Frontend Dev', 'Backend Dev', 'Full Stack', 'DevOps', 'UI/UX Designer']

export default function OnboardingPage() {
    const router = useRouter()
    const [currentStep, setCurrentStep] = React.useState(1)
    const [isLoading, setIsLoading] = React.useState(false)
    const [showOtherSkillInput, setShowOtherSkillInput] = React.useState(false)
    const [formData, setFormData] = React.useState<OnboardingData>({
        input1_name: '',
        input2_email: '',
        input_password: '',
        select1_branch: '',
        select2_year: '',
        input3_cgpa: '',
        input4_linkedin: '',
        input5_github: '',
        input6_portfolio: '',
        file1_resume: null,
        multi_skills: [],
        input_other_skill: '',
        input7_project1_title: '',
        textarea1_project1_desc: '',
        input8_project2_title: '',
        textarea2_project2_desc: '',
        textarea3_internships: '',
        textarea4_certifications: '',
        multi_roles: [],
        input9_target_companies: '',
    })

    const dotsRef = React.useRef<HTMLDivElement[]>([])

    React.useEffect(() => {
        // Floating dots animation
        dotsRef.current.forEach((dot) => {
            if (!dot) return
            const randomX = gsap.utils.random(-30, 30)
            const randomY = gsap.utils.random(-30, 30)
            const randomDuration = gsap.utils.random(6, 10)

            gsap.to(dot, {
                x: randomX,
                y: randomY,
                duration: randomDuration,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut'
            })
        })
    }, [])

    // Handlers
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSelectChange = (name: string, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSkillSelect = (skill: string) => {
        if (skill === 'Others') {
            setShowOtherSkillInput(true)
            return
        }

        if (!formData.multi_skills.includes(skill)) {
            setFormData(prev => ({
                ...prev,
                multi_skills: [...prev.multi_skills, skill]
            }))
        } else {
            toast.info(`${skill} is already selected`)
        }
    }

    const addManualSkill = () => {
        if (formData.input_other_skill.trim()) {
            const skill = formData.input_other_skill.trim()
            if (!formData.multi_skills.includes(skill)) {
                setFormData(prev => ({
                    ...prev,
                    multi_skills: [...prev.multi_skills, skill],
                    input_other_skill: ''
                }))
                setShowOtherSkillInput(false)
            } else {
                toast.info(`${skill} is already added`)
            }
        }
    }

    const removeSkill = (skillToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            multi_skills: prev.multi_skills.filter(skill => skill !== skillToRemove)
        }))
    }

    const toggleRole = (role: string) => {
        setFormData(prev => {
            const roles = prev.multi_roles.includes(role)
                ? prev.multi_roles.filter(r => r !== role)
                : [...prev.multi_roles, role]
            return { ...prev, multi_roles: roles }
        })
    }

    const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0]
            if (file.type === 'application/pdf') {
                setFormData((prev) => ({ ...prev, file1_resume: file }))
            } else {
                toast.error('Please upload a PDF file')
            }
        }
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            if (file.type === 'application/pdf') {
                setFormData((prev) => ({ ...prev, file1_resume: file }))
            } else {
                toast.error('Please upload a PDF file')
            }
        }
    }

    const removeFile = (e: React.MouseEvent) => {
        e.stopPropagation()
        setFormData(prev => ({ ...prev, file1_resume: null }))
    }

    const nextStep = () => {
        if (currentStep === 1) {
            // Just validate inputs
            if (!formData.input1_name || !formData.input2_email || !formData.input_password) {
                toast.error("Please fill in Name, Email and Password.")
                return
            }
            setCurrentStep((prev) => prev + 1)
        } else if (currentStep < 5) {
            setCurrentStep((prev) => prev + 1)
        }
    }

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep((prev) => prev - 1)
    }

    const handleSubmit = async () => {
        setIsLoading(true)

        try {
            // 1. Register User
            const signupResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.input2_email,
                    password: formData.input_password,
                    role: 'student'
                })
            })

            let token = ''
            if (signupResponse.ok) {
                const signupData = await signupResponse.json()
                token = signupData.access_token
                localStorage.setItem('token', token)
                localStorage.setItem('user_email', formData.input2_email)
                localStorage.setItem('role', 'student')
            } else {
                const errorData = await signupResponse.json()
                toast.error(errorData.detail || "Registration failed")
                setIsLoading(false)
                return
            }

            // 2. Submit Onboarding Data
            const cleanData = {
                name: formData.input1_name,
                email: formData.input2_email,
                branch: formData.select1_branch,
                year: formData.select2_year,
                cgpa: formData.input3_cgpa,
                linkedin: formData.input4_linkedin,
                github: formData.input5_github,
                portfolio: formData.input6_portfolio,
                skills: formData.multi_skills,
                major_projects: [
                    { title: formData.input7_project1_title, description: formData.textarea1_project1_desc },
                    { title: formData.input8_project2_title, description: formData.textarea2_project2_desc }
                ].filter(p => p.title),
                internships: formData.textarea3_internships,
                certifications: formData.textarea4_certifications,
                target_roles: formData.multi_roles,
                target_companies: formData.input9_target_companies
            }

            const data = new FormData()
            data.append('student_data_json', JSON.stringify(cleanData))

            if (formData.file1_resume) {
                data.append('resume', formData.file1_resume)
            }

            const onboardResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/student/onboard`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                    // data form boundary is automatically set by browser
                },
                body: data,
            })

            if (onboardResponse.ok) {
                // Show glowing loader for 2 seconds
                await new Promise(resolve => setTimeout(resolve, 2000))
                router.push('/dashboard')
            } else {
                console.error('Submission failed')
                // If onboard fails but signup succeded, we are in weird state.
                // For now, just show error.
                const errorData = await onboardResponse.json()
                toast.error(errorData.detail || 'Onboarding failed.')
                setIsLoading(false)
            }
        } catch (error) {
            console.error('Error submitting form:', error)
            toast.error('An error occurred. Please try again.')
            setIsLoading(false)
        }
    }

    if (isLoading) {
        return (
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/90 backdrop-blur-md">
                <div className="relative flex flex-col items-center">
                    <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20 animate-pulse rounded-full"></div>
                    <div className="h-24 w-24 animate-spin rounded-full border-4 border-blue-600 border-t-transparent shadow-[0_0_30px_rgba(37,99,235,0.5)] relative z-10"></div>
                    <p className="mt-8 animate-pulse text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent drop-shadow-sm relative z-10">
                        Generating your PRS Score...
                    </p>
                    <p className="text-gray-500 mt-2 text-sm">Analyzing your digital footprint & resume...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-white via-blue-50 to-indigo-50 p-4 md:p-8 flex items-center justify-center relative overflow-hidden">

            {/* Background Elements */}
            <div className="absolute inset-0 -z-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 right-0 w-96 h-96 bg-gradient-to-br from-blue-200 to-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
                <div className="absolute top-1/2 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-200 to-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-pulse" style={{ animationDelay: '2s' }}></div>
                <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-gradient-to-tl from-indigo-200 to-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-15"></div>

                {/* Floating dots */}
                {[...Array(6)].map((_, i) => (
                    <div
                        key={i}
                        ref={(el) => {
                            if (el) dotsRef.current[i] = el
                        }}
                        className="absolute w-2 h-2 bg-blue-400 rounded-full opacity-20"
                        style={{
                            left: `${20 + i * 15}%`,
                            top: `${30 + (i % 2) * 40}%`
                        }}
                    ></div>
                ))}
            </div>

            <div className="w-full max-w-4xl relative z-10">

                {/* Stepper */}
                <div className="mb-10 relative px-4">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -z-10 -translate-y-1/2 hidden md:block rounded-full"></div>
                    <div className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 -z-10 -translate-y-1/2 hidden md:block rounded-full transition-all duration-500 ease-out" style={{ width: `${((currentStep - 1) / 4) * 100}%` }}></div>

                    <div className="flex justify-between items-center">
                        {steps.map((step) => (
                            <div key={step.id} className="flex flex-col items-center relative group">
                                <div
                                    className={cn(
                                        "flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full border-2 transition-all duration-300 relative bg-white",
                                        currentStep >= step.id
                                            ? "border-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.3)] text-blue-600 scale-110"
                                            : "border-gray-200 text-gray-400"
                                    )}
                                >
                                    {currentStep > step.id ? (
                                        <Check className="h-5 w-5 md:h-6 md:w-6" />
                                    ) : (
                                        <step.icon className={cn("h-4 w-4 md:h-5 md:w-5 transition-colors", currentStep >= step.id ? "text-blue-600" : "text-gray-400")} />
                                    )}

                                    {currentStep === step.id && (
                                        <span className="absolute inset-0 rounded-full animate-ping border border-blue-400 opacity-20"></span>
                                    )}
                                </div>
                                <span className={cn(
                                    "absolute -bottom-8 text-[10px] md:text-xs font-bold whitespace-nowrap transition-all duration-300 tracking-tight text-center w-24",
                                    currentStep >= step.id ? "text-blue-800 translate-y-0 opacity-100" : "text-gray-400 translate-y-1 opacity-70"
                                )}>
                                    {step.title}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <Card className="border border-white/40 bg-white/60 backdrop-blur-xl shadow-2xl relative overflow-hidden rounded-2xl ring-1 ring-white/60 min-h-[500px] flex flex-col">

                    <CardHeader className="border-b border-white/20 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 p-6 md:p-8">
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-2xl md:text-3xl font-black bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent pb-1">
                                    {steps[currentStep - 1].title}
                                </CardTitle>
                                <CardDescription className="text-sm md:text-base font-medium text-gray-500">
                                    Step {currentStep} of 5: {steps[currentStep - 1].title}
                                </CardDescription>
                            </div>
                            <div className="h-10 w-10 bg-blue-100/50 rounded-full flex items-center justify-center text-blue-600 shadow-inner">
                                <span className="font-bold">{currentStep}/5</span>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="p-6 md:p-8 flex-1 overflow-y-auto max-h-[60vh]">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStep}
                                initial={{ opacity: 0, x: 20, filter: 'blur(5px)' }}
                                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                                exit={{ opacity: 0, x: -20, filter: 'blur(5px)' }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                                className="space-y-6"
                            >
                                {/* Step 1: Identity & Academics */}
                                {currentStep === 1 && (
                                    <div className="space-y-5">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div className="space-y-2">
                                                <Label htmlFor="input1_name" className="text-gray-700 font-semibold">Full Name</Label>
                                                <Input
                                                    id="input1_name"
                                                    name="input1_name"
                                                    placeholder="John Doe"
                                                    value={formData.input1_name}
                                                    onChange={handleInputChange}
                                                    className="bg-white/70 border-gray-200 focus:border-blue-500 h-11"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="input2_email" className="text-gray-700 font-semibold">College Email</Label>
                                                <Input
                                                    id="input2_email"
                                                    name="input2_email"
                                                    type="email"
                                                    placeholder="john@college.edu"
                                                    value={formData.input2_email}
                                                    onChange={handleInputChange}
                                                    className="bg-white/70 border-gray-200 focus:border-blue-500 h-11"
                                                />
                                            </div>
                                            <div className="space-y-2 col-span-1 md:col-span-2">
                                                <Label htmlFor="input_password" className="text-gray-700 font-semibold">Create Password</Label>
                                                <Input
                                                    id="input_password"
                                                    name="input_password"
                                                    type="password"
                                                    placeholder="••••••••"
                                                    value={formData.input_password}
                                                    onChange={handleInputChange}
                                                    className="bg-white/70 border-gray-200 focus:border-blue-500 h-11"
                                                />
                                                <p className="text-xs text-gray-500">Your account will be created instantly.</p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                            <div className="space-y-2">
                                                <Label className="text-gray-700 font-semibold">Branch</Label>
                                                <Select
                                                    value={formData.select1_branch}
                                                    onValueChange={(val) => handleSelectChange('select1_branch', val)}
                                                >
                                                    <SelectTrigger className="bg-white/70 h-11">
                                                        <SelectValue placeholder="Select Branch" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="CSE">CSE</SelectItem>
                                                        <SelectItem value="IT">IT</SelectItem>
                                                        <SelectItem value="ECS">ECS</SelectItem>
                                                        <SelectItem value="ECE">ECE</SelectItem>
                                                        <SelectItem value="ME">ME</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-gray-700 font-semibold">Year</Label>
                                                <Select
                                                    value={formData.select2_year}
                                                    onValueChange={(val) => handleSelectChange('select2_year', val)}
                                                >
                                                    <SelectTrigger className="bg-white/70 h-11">
                                                        <SelectValue placeholder="Select Year" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="1">1st Year (FY)</SelectItem>
                                                        <SelectItem value="2">2nd Year (SY)</SelectItem>
                                                        <SelectItem value="3">3rd Year (TY)</SelectItem>
                                                        <SelectItem value="4">4th Year (Final)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="input3_cgpa" className="text-gray-700 font-semibold">Current CGPA</Label>
                                                <Input
                                                    id="input3_cgpa"
                                                    name="input3_cgpa"
                                                    type="number"
                                                    step="0.01"
                                                    max="10"
                                                    placeholder="e.g. 8.5"
                                                    value={formData.input3_cgpa}
                                                    onChange={handleInputChange}
                                                    className="bg-white/70 h-11"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Step 2: Digital Footprint */}
                                {currentStep === 2 && (
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="input4_linkedin" className="flex items-center gap-2 text-gray-700 font-semibold">
                                                <Linkedin className="h-4 w-4 text-blue-700" /> LinkedIn Profile URL
                                            </Label>
                                            <Input
                                                id="input4_linkedin"
                                                name="input4_linkedin"
                                                placeholder="https://linkedin.com/in/..."
                                                value={formData.input4_linkedin}
                                                onChange={handleInputChange}
                                                className="bg-white/70 h-11"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="input5_github" className="flex items-center gap-2 text-gray-700 font-semibold">
                                                <Github className="h-4 w-4 text-gray-900" /> GitHub Profile URL
                                            </Label>
                                            <Input
                                                id="input5_github"
                                                name="input5_github"
                                                placeholder="https://github.com/..."
                                                value={formData.input5_github}
                                                onChange={handleInputChange}
                                                className="bg-white/70 h-11"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="input6_portfolio" className="flex items-center gap-2 text-gray-700 font-semibold">
                                                <Globe className="h-4 w-4 text-emerald-600" /> Portfolio Website (Optional)
                                            </Label>
                                            <Input
                                                id="input6_portfolio"
                                                name="input6_portfolio"
                                                placeholder="https://yourname.com"
                                                value={formData.input6_portfolio}
                                                onChange={handleInputChange}
                                                className="bg-white/70 h-11"
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Step 3: Professional Assets */}
                                {currentStep === 3 && (
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <Label className="text-gray-700 font-semibold flex items-center gap-2">
                                                <Upload className="h-4 w-4" /> Resume Upload (PDF)
                                            </Label>
                                            <div
                                                className={cn(
                                                    "flex flex-col items-center justify-center h-40 border-2 border-dashed rounded-2xl transition-all duration-300 cursor-pointer relative overflow-hidden group bg-white/40",
                                                    formData.file1_resume
                                                        ? "border-emerald-500/50 bg-emerald-50/50"
                                                        : "border-gray-300 hover:border-blue-500 hover:bg-blue-50/30"
                                                )}
                                                onDragOver={(e) => e.preventDefault()}
                                                onDrop={handleFileDrop}
                                                onClick={() => document.getElementById('file-upload')?.click()}
                                            >
                                                <input
                                                    id="file-upload"
                                                    type="file"
                                                    className="hidden"
                                                    accept=".pdf"
                                                    onChange={handleFileSelect}
                                                />
                                                {formData.file1_resume ? (
                                                    <div className="text-center relative z-10 w-full px-4">
                                                        <button
                                                            onClick={removeFile}
                                                            className="absolute -top-2 right-0 p-1 hover:bg-red-100 rounded-full text-red-500"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                        <div className="flex items-center justify-center gap-2 text-emerald-700 font-bold">
                                                            <Check className="h-5 w-5" />
                                                            <span className="truncate max-w-[200px]">{formData.file1_resume.name}</span>
                                                        </div>
                                                        <p className="text-xs text-emerald-600 mt-1">Ready to upload</p>
                                                    </div>
                                                ) : (
                                                    <div className="text-center p-4">
                                                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2 group-hover:text-blue-500 transition-colors" />
                                                        <p className="text-sm font-medium text-gray-600">Drag & drop or click to upload</p>
                                                        <p className="text-xs text-gray-400 mt-1">PDF only (Max 5MB)</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <Label className="text-gray-700 font-semibold">Skills</Label>
                                            <div className="flex gap-2">
                                                <Select onValueChange={handleSkillSelect}>
                                                    <SelectTrigger className="bg-white/70 h-11 w-full">
                                                        <SelectValue placeholder="Select a skill to add..." />
                                                    </SelectTrigger>
                                                    <SelectContent className="max-h-[200px]">
                                                        {ALL_SKILLS.map(skill => (
                                                            <SelectItem key={skill} value={skill}>{skill}</SelectItem>
                                                        ))}
                                                        <SelectItem value="Others" className="font-bold text-blue-600">Others (Type manual)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {/* Manual Entry for "Others" */}
                                            <AnimatePresence>
                                                {showOtherSkillInput && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="flex gap-2"
                                                    >
                                                        <Input
                                                            placeholder="Type your skill..."
                                                            value={formData.input_other_skill}
                                                            onChange={(e) => setFormData(prev => ({ ...prev, input_other_skill: e.target.value }))}
                                                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addManualSkill(); } }}
                                                            className="bg-white/70 h-11"
                                                            autoFocus
                                                        />
                                                        <Button onClick={addManualSkill} className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white">
                                                            <Plus className="h-4 w-4 mr-1" /> Add
                                                        </Button>
                                                        <Button onClick={() => setShowOtherSkillInput(false)} variant="ghost" className="shrink-0">
                                                            Cancel
                                                        </Button>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>

                                            {/* Selected Skills Chips */}
                                            <div className="flex flex-wrap gap-2 mt-2 min-h-[40px] p-2 bg-white/30 rounded-lg border border-white/40">
                                                {formData.multi_skills.length === 0 && <span className="text-sm text-gray-400 italic p-1">No skills added yet</span>}
                                                {formData.multi_skills.map((skill) => (
                                                    <div
                                                        key={skill}
                                                        className="flex items-center gap-1 pl-3 pr-1 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700 border border-blue-200 shadow-sm animate-in fade-in zoom-in duration-200"
                                                    >
                                                        {skill}
                                                        <button
                                                            onClick={() => removeSkill(skill)}
                                                            className="p-0.5 hover:bg-blue-200 rounded-full transition-colors ml-1"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Step 4: Projects & Experience */}
                                {currentStep === 4 && (
                                    <div className="space-y-6">
                                        <div className="space-y-4">
                                            <Label className="text-lg font-bold text-gray-800">Major Projects (Top 2)</Label>
                                            <div className="p-4 bg-white/40 rounded-xl border border-white/50 space-y-3">
                                                <Input
                                                    name="input7_project1_title"
                                                    placeholder="Project 1 Title"
                                                    value={formData.input7_project1_title}
                                                    onChange={handleInputChange}
                                                    className="bg-white/80 font-semibold border-transparent focus:border-blue-500"
                                                />
                                                <Textarea
                                                    name="textarea1_project1_desc"
                                                    placeholder="Short description of Project 1..."
                                                    value={formData.textarea1_project1_desc}
                                                    onChange={handleInputChange}
                                                    className="bg-white/80 border-transparent focus:border-blue-500 resize-none h-20"
                                                />
                                            </div>
                                            <div className="p-4 bg-white/40 rounded-xl border border-white/50 space-y-3">
                                                <Input
                                                    name="input8_project2_title"
                                                    placeholder="Project 2 Title"
                                                    value={formData.input8_project2_title}
                                                    onChange={handleInputChange}
                                                    className="bg-white/80 font-semibold border-transparent focus:border-blue-500"
                                                />
                                                <Textarea
                                                    name="textarea2_project2_desc"
                                                    placeholder="Short description of Project 2..."
                                                    value={formData.textarea2_project2_desc}
                                                    onChange={handleInputChange}
                                                    className="bg-white/80 border-transparent focus:border-blue-500 resize-none h-20"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="font-semibold text-gray-700">Internship Experience</Label>
                                                <Textarea
                                                    name="textarea3_internships"
                                                    placeholder="Role, Company, Duration..."
                                                    value={formData.textarea3_internships}
                                                    onChange={handleInputChange}
                                                    className="bg-white/70 h-24 resize-none"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="font-semibold text-gray-700">Certifications</Label>
                                                <Textarea
                                                    name="textarea4_certifications"
                                                    placeholder="AWS, Coursera, NPTEL..."
                                                    value={formData.textarea4_certifications}
                                                    onChange={handleInputChange}
                                                    className="bg-white/70 h-24 resize-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Step 5: Career Ambition */}
                                {currentStep === 5 && (
                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <Label className="text-gray-700 font-semibold flex items-center gap-2">
                                                <Target className="h-4 w-4" /> Target Roles
                                            </Label>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                {COMMON_ROLES.map((role) => (
                                                    <button
                                                        key={role}
                                                        type="button"
                                                        onClick={() => toggleRole(role)}
                                                        className={cn(
                                                            "flex items-center justify-center p-3 rounded-lg border text-sm font-medium transition-all duration-200",
                                                            formData.multi_roles.includes(role)
                                                                ? "border-blue-600 bg-blue-50 text-blue-700 shadow-md"
                                                                : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                                                        )}
                                                    >
                                                        {role}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-gray-700 font-semibold">Target Companies</Label>
                                            <Input
                                                name="input9_target_companies"
                                                placeholder="Google, TCS, Microsoft, Startups..."
                                                value={formData.input9_target_companies}
                                                onChange={handleInputChange}
                                                className="bg-white/70 h-12 text-lg"
                                            />
                                            <p className="text-xs text-gray-500">Separated by commas</p>
                                        </div>
                                    </div>
                                )}

                            </motion.div>
                        </AnimatePresence>
                    </CardContent>

                    <CardFooter className="flex justify-between p-6 md:p-8 bg-gray-50/50 border-t border-gray-100 mt-auto">
                        <Button
                            variant="outline"
                            onClick={prevStep}
                            disabled={currentStep === 1}
                            className="gap-2 border-gray-200 text-gray-600"
                        >
                            <ChevronLeft className="h-4 w-4" /> Back
                        </Button>

                        {currentStep < 5 ? (
                            <Button
                                onClick={nextStep}
                                className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/30 transition-all rounded-lg px-6"
                            >
                                Next Step <ChevronRight className="h-4 w-4" />
                            </Button>
                        ) : (
                            <Button
                                onClick={handleSubmit}
                                className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/30 transition-all rounded-lg px-8 py-6 text-lg font-bold"
                            >
                                Complete Onboarding
                            </Button>
                        )}
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
