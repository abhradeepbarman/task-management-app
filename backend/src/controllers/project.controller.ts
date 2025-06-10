import { Request, Response } from "express";
import Project from "../models/project.model";
import createProjectSchema from "../validators/project/create-project.validator";
import TeamMember from "../models/team-member.model";
import updateProjectSchema from "../validators/project/update-project.validator";

const projectControllers = {
    async getAllProjects(req: Request, res: Response): Promise<any> {
        try {
            const adminId = req.user?.id;
            const page = req.query.page
                ? parseInt(req.query.page as string)
                : null;
            const limit = req.query.limit
                ? parseInt(req.query.limit as string)
                : null;

            let projects;
            let total;

            if (page && limit) {
                const skip = (page - 1) * limit;

                projects = await Project.find({ adminId })
                    .skip(skip)
                    .limit(limit)
                    .populate("teamMembers");

                total = await Project.countDocuments({ adminId });

                return res.status(200).json({
                    success: true,
                    data: projects,
                    pagination: {
                        total,
                        page,
                        limit,
                    },
                });
            } else {
                projects = await Project.find({ adminId });
                return res.status(200).json({ success: true, data: projects });
            }
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Something went wrong",
            });
        }
    },

    async createProject(req: Request, res: Response): Promise<any> {
        try {
            const { name, description, teamMembers } =
                createProjectSchema.parse(req.body);
            const adminId = req.user?.id;

            teamMembers.forEach(async (teamMember) => {
                const teamMemberDetails = await TeamMember.find({
                    _id: teamMember,
                    adminId,
                });

                if (!teamMemberDetails) {
                    return res.status(404).json({
                        success: false,
                        message: "Team member not found",
                    });
                }
            });

            const project = await Project.create({
                adminId,
                name,
                description,
                teamMembers,
            });
            return res.status(200).json({ success: true, data: project });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Something went wrong",
            });
        }
    },

    async deleteProject(req: Request, res: Response): Promise<any> {
        try {
            const projectId = req.params.id;
            const adminId = req.user?.id;

            const projectDetails = await Project.findOne({
                _id: projectId,
                adminId,
            });
            if (!projectDetails) {
                return res.status(404).json({
                    success: false,
                    message: "Project not found",
                });
            }

            await Project.findByIdAndDelete(projectId);
            return res.status(200).json({
                success: true,
                message: "Project deleted successfully",
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Something went wrong",
            });
        }
    },

    async updateProject(req: Request, res: Response): Promise<any> {
        try {
            const projectId = req.params.id;
            const { name, description, teamMembers } =
                updateProjectSchema.parse(req.body);
            const adminId = req.user?.id;

            const projectDetails = await Project.findOne({
                _id: projectId,
                adminId,
            });
            if (!projectDetails) {
                return res.status(404).json({
                    success: false,
                    message: "Project not found",
                });
            }

            const updatedProject = await Project.findByIdAndUpdate(
                projectId,
                { name, description, teamMembers },
                { new: true }
            );

            return res.status(200).json({
                success: true,
                data: updatedProject,
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Something went wrong",
            });
        }
    },
};

export default projectControllers;
