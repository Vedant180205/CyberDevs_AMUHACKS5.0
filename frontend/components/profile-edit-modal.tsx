'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Loader2, Edit2, Save } from 'lucide-react'
import api from '@/lib/api'

interface ProfileEditModalProps {
    studentData: any
    onUpdate: () => void
}

export function ProfileEditModal({ studentData, onUpdate }: ProfileEditModalProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: studentData?.name || '',
        year: studentData?.year || '',
        branch: studentData?.branch || '',
        cgpa: studentData?.cgpa || '',
        skills: studentData?.skills ? studentData.skills.join(', ') : '',
        linkedin_url: studentData?.linkedin_url || '',
        github_url: studentData?.github_url || ''
    })

    const [resumeFile, setResumeFile] = useState<File | null>(null)
    const [analyzingResume, setAnalyzingResume] = useState(false)
    const [resumeAnalysis, setResumeAnalysis] = useState<any>(null)


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setResumeFile(e.target.files[0])
            handleAnalyzeResume(e.target.files[0])
        }
    }

    const handleAnalyzeResume = async (file: File) => {
        setAnalyzingResume(true)
        try {
            const formData = new FormData()
            formData.append('file', file)

            const res = await api.post('/api/student/analyze/resume', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })

            // Store analysis result
            setResumeAnalysis(res.data)
            alert(`✅ Resume Analyzed! ATS Score: ${res.data.ats_score}/100`)

            // Auto-fill skills if found inside the nested 'analysis' object
            const analysisData = res.data.analysis;
            if (analysisData && analysisData.skills && Array.isArray(analysisData.skills)) {
                const newSkills = analysisData.skills.join(', ')
                setFormData(prev => {
                    const currentSkills = prev.skills || ''
                    // Avoid duplicates if possible but simple concatenation is fine for now
                    return {
                        ...prev,
                        skills: currentSkills ? `${currentSkills}, ${newSkills}` : newSkills
                    }
                })
            }

        } catch (error) {
            console.error('Resume analysis error:', error)
            alert('Failed to analyze resume. Please try again.')
        } finally {
            setAnalyzingResume(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const payload = {
                ...formData,
                cgpa: parseFloat(formData.cgpa.toString()),
                skills: typeof formData.skills === 'string'
                    ? formData.skills.split(',').map((s: string) => s.trim()).filter((s: string) => s !== '')
                    : formData.skills,
            }

            await api.put('/api/student/update', payload)
            onUpdate() // Refresh parent data
            setOpen(false)
        } catch (error) {
            console.error('Update profile error:', error)
            alert('Failed to update profile. Please check your inputs.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="hidden md:flex gap-2">
                    <Edit2 className="h-4 w-4" />
                    Edit Profile
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Profile Details</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    {/* Resume Upload Section */}
                    <div className="p-4 border border-dashed rounded-lg bg-gray-50 text-center">
                        <Label htmlFor="resume" className="cursor-pointer block">
                            <div className="flex flex-col items-center gap-2">
                                <div className="p-2 bg-blue-100 rounded-full text-blue-600">
                                    {analyzingResume ? <Loader2 className="h-6 w-6 animate-spin" /> : <Edit2 className="h-6 w-6" />}
                                </div>
                                <span className="text-sm font-medium text-gray-700">
                                    {analyzingResume ? "Analyzing Resume..." : "Upload Resume Image for AI Analysis"}
                                </span>
                                <span className="text-xs text-gray-500">
                                    Upload an image of your resume to auto-extract skills and get an ATS score.
                                </span>
                            </div>
                            <Input
                                id="resume"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileChange}
                                disabled={analyzingResume}
                            />
                        </Label>
                        {resumeAnalysis && (
                            <div className="mt-3 text-sm text-left bg-green-50 p-3 rounded border border-green-100">
                                <p className="font-semibold text-green-700">✅ Analysis Complete</p>
                                <p>ATS Score: <strong>{resumeAnalysis.ats_score}/100</strong></p>
                                <p className="text-xs mt-1 text-gray-600">Skills extracted and added to form.</p>
                            </div>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Year</Label>
                            <Select value={formData.year} onValueChange={(val) => handleSelectChange('year', val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Year" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="FY">First Year</SelectItem>
                                    <SelectItem value="SY">Second Year</SelectItem>
                                    <SelectItem value="TY">Third Year</SelectItem>
                                    <SelectItem value="FINAL">Final Year</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label>Branch</Label>
                            <Select value={formData.branch} onValueChange={(val) => handleSelectChange('branch', val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Branch" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="CSE">CSE</SelectItem>
                                    <SelectItem value="IT">IT</SelectItem>
                                    <SelectItem value="ECS">ECS</SelectItem>
                                    <SelectItem value="ENTC">ENTC</SelectItem>
                                    <SelectItem value="MECH">MECH</SelectItem>
                                    <SelectItem value="CIVIL">CIVIL</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="cgpa">CGPA (out of 10)</Label>
                        <Input id="cgpa" name="cgpa" type="number" step="0.01" min="0" max="10" value={formData.cgpa} onChange={handleChange} required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="skills">Technical Skills (comma separated)</Label>
                        <Input id="skills" name="skills" value={formData.skills} onChange={handleChange} required placeholder="Python, React, AWS..." />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="linkedin_url">LinkedIn URL</Label>
                        <Input id="linkedin_url" name="linkedin_url" value={formData.linkedin_url} onChange={handleChange} placeholder="https://linkedin.com/in/..." />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="github_url">GitHub URL</Label>
                        <Input id="github_url" name="github_url" value={formData.github_url} onChange={handleChange} placeholder="https://github.com/..." />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
