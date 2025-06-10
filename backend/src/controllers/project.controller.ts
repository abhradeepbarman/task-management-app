import { NextFunction, Request, Response } from "express";
import Project from "../models/project.model";
import createProjectSchema from "../validators/project/create-project.validator";
import TeamMember from "../models/team-member.model";
import updateProjectSchema from "../validators/project/update-project.validator";
import CustomErrorHandler from "../utils/CustomErrorHandler";
import ResponseHandler from "../utils/ResponseHandler";
import Task from "../models/task.model";

const projectControllers = {
    async getAllProjects(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<any> {
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

                return res.status(200).send(
                    ResponseHandler(200, "success", {
                        data: projects,
                        pagination: {
                            total,
                            page,
                            limit,
                            totalPages: Math.ceil(total / limit),
                        },
                    })
                );
            } else {
                projects = await Project.find({ adminId }).populate("teamMembers");
                return res
                    .status(200)
                    .send(ResponseHandler(200, "success", projects));
            }
        } catch (error) {
            return next(error);
        }
    },

    async createProject(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<any> {
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
                    return res.send(
                        CustomErrorHandler.notFound("Team member not found")
                    );
                }
            });

            const project = await Project.create({
                adminId,
                name,
                description,
                teamMembers,
            });

            const populatedProject = await Project.findById(
                project._id
            ).populate("teamMembers");

            return res
                .status(200)
                .send(ResponseHandler(200, "success", populatedProject));
        } catch (error) {
            return next(error);
        }
    },

    async deleteProject(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<any> {
        try {
            const projectId = req.params.id;
            const adminId = req.user?.id;

            const projectDetails = await Project.findOne({
                _id: projectId,
                adminId,
            });
            if (!projectDetails) {
                return res.send(
                    CustomErrorHandler.notFound("Project not found")
                );
            }

            await Task.deleteMany({ projectId });
            await Project.findByIdAndDelete(projectId);

            return res
                .status(200)
                .send(ResponseHandler(200, "Project deleted successfully"));
        } catch (error) {
            return next(error);
        }
    },

    async updateProject(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<any> {
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
                return res.send(
                    CustomErrorHandler.notFound("Project not found")
                );
            }

            if (teamMembers && teamMembers.length > 0) {
                teamMembers.forEach(async (teamMember) => {
                    const teamMemberDetails = await TeamMember.find({
                        _id: teamMember,
                        adminId,
                    });

                    if (!teamMemberDetails) {
                        return res.send(
                            CustomErrorHandler.notFound("Team member not found")
                        );
                    }
                });
            }

            const updatedProject = await Project.findByIdAndUpdate(
                projectId,
                {
                    name: name || projectDetails.name,
                    description: description || projectDetails.description,
                    teamMembers: teamMembers || projectDetails.teamMembers,
                },
                { new: true }
            ).populate("teamMembers");

            return res
                .status(200)
                .send(ResponseHandler(200, "success", updatedProject));
        } catch (error) {
            return next(error);
        }
    },
};

export default projectControllers;
