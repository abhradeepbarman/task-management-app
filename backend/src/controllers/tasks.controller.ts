import { NextFunction, Request, Response } from "express";
import Project from "../models/project.model";
import Task from "../models/task.model";
import TeamMember from "../models/team-member.model";
import CustomErrorHandler from "../utils/CustomErrorHandler";
import ResponseHandler from "../utils/ResponseHandler";
import createTaskSchema from "../validators/task/create-task.validator";
import updateTaskSchema from "../validators/task/update-task.validator";

const taskControllers = {
    async getAllTasks(
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

            const {
                projectId,
                memberId,
                status,
                search, // title or description
                startDate,
                endDate,
            } = req.query;

            // Base filter
            const filter: any = { adminId };

            // Filter by project
            if (projectId) {
                filter.projectId = projectId;
            }

            // Filter by assigned member
            if (memberId) {
                filter.assignedMembers = memberId;
            }

            // Filter by task status
            if (status) {
                filter.status = status;
            }

            // Filter by date range 
            if (startDate || endDate) {
                filter.deadline = {};
                if (startDate) {
                    filter.deadline.$gte = new Date(startDate as string);
                }
                if (endDate) {
                    filter.deadline.$lte = new Date(endDate as string);
                }
            }

            // Search in title or description (case-insensitive)
            if (search) {
                filter.$or = [
                    { title: { $regex: search, $options: "i" } },
                    { description: { $regex: search, $options: "i" } },
                ];
            }

            let tasks;
            let total;

            if (page && limit) {
                const skip = (page - 1) * limit;

                tasks = await Task.find(filter)
                    .skip(skip)
                    .limit(limit)
                    .populate("assignedMembers")
                    .populate("projectId");

                total = await Task.countDocuments(filter);

                return res.status(200).send(
                    ResponseHandler(200, "success", {
                        data: tasks,
                        pagination: {
                            total,
                            page,
                            limit,
                            totalPages: Math.ceil(total / limit),
                        },
                    })
                );
            } else {
                tasks = await Task.find(filter)
                    .populate("assignedMembers")
                    .populate("projectId");

                return res
                    .status(200)
                    .send(ResponseHandler(200, "success", tasks));
            }
        } catch (error) {
            return next(error);
        }
    },

    async createTask(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<any> {
        try {
            const {
                title,
                description,
                deadline,
                projectId,
                assignedMembers,
                status,
            } = createTaskSchema.parse(req.body);
            const adminId = req.user?.id;

            console.log("deadline", deadline);

            // Verify project exists and belongs to admin
            const project = await Project.findOne({
                _id: projectId,
                adminId,
            }).populate("teamMembers");
            if (!project) {
                return res.send(
                    CustomErrorHandler.notFound("Project not found")
                );
            }

            const projectTeamMemberIds = project.teamMembers.map((member) =>
                member._id.toString()
            );

            // verify if all team memebers are related to the project
            assignedMembers.forEach((memberId) => {
                if (!projectTeamMemberIds.includes(memberId)) {
                    return res.send(
                        CustomErrorHandler.unAuthorized(
                            `Team ID ${memberId} not authorized`
                        )
                    );
                }
            });

            const task = await Task.create({
                title,
                description,
                deadline: new Date(deadline),
                projectId,
                assignedMembers,
                status: status,
                adminId,
            });

            const populatedTask = await Task.findById(task._id)
                .populate("assignedMembers")
                .populate("projectId");

            return res
                .status(201)
                .send(ResponseHandler(201, "Task created", populatedTask));
        } catch (error) {
            return next(error);
        }
    },

    async updateTask(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<any> {
        try {
            const taskId = req.params.id;
            const adminId = req.user?.id;
            console.log("1");

            const updates = updateTaskSchema.parse(req.body);
            console.log("2");

            const task = await Task.findById(taskId);
            if (!task) {
                return res.send(CustomErrorHandler.notFound("Task not found"));
            }

            // Verify project belongs to admin
            const project = await Project.findOne({
                _id: task.projectId,
                adminId,
            }).populate("teamMembers");

            if (!project) {
                return res.send(
                    CustomErrorHandler.notFound("Project not found")
                );
            }

            if (!project.adminId.equals(adminId)) {
                return res.send(CustomErrorHandler.unAuthorized());
            }

            // If updating assigned members, verify they exist and belong to admin
            if (updates.assignedMembers) {
                const projectTeamMemberIds = project.teamMembers.map((member) =>
                    member._id.toString()
                );

                for (const memberId of updates.assignedMembers) {
                    const teamMember = await TeamMember.findOne({
                        _id: memberId,
                        adminId,
                    });
                    if (!teamMember) {
                        return res.send(
                            CustomErrorHandler.notFound("Team member not found")
                        );
                    }

                    if (!projectTeamMemberIds.includes(memberId)) {
                        return res.send(CustomErrorHandler.unAuthorized());
                    }
                }
            }

            const updatedTask = await Task.findByIdAndUpdate(
                taskId,
                {
                    title: updates.title || task.title,
                    description: updates.description || task.description,
                    deadline: updates.deadline || task.deadline,
                    projectId: updates.projectId || task.projectId,
                    assignedMembers:
                        updates.assignedMembers || task.assignedMembers,
                    status: updates.status || task.status,
                },
                {
                    new: true,
                }
            )
                .populate("projectId")
                .populate("assignedMembers");

            return res
                .status(200)
                .send(ResponseHandler(200, "Task updated", updatedTask));
        } catch (error) {
            return next(error);
        }
    },

    async deleteTask(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<any> {
        try {
            const taskId = req.params.id;
            const adminId = req.user?.id;

            const task = await Task.findById(taskId).populate("projectId");
            if (!task) {
                return res.send(CustomErrorHandler.notFound("Task not found"));
            }

            // Verify project belongs to admin
            const project = await Project.findOne({
                _id: task.projectId,
                adminId,
            });
            if (!project) {
                return res.send(
                    CustomErrorHandler.notFound("Project not found")
                );
            }

            if (!project.adminId.equals(adminId)) {
                return res.send(CustomErrorHandler.unAuthorized());
            }

            await Task.findByIdAndDelete(taskId);
            return res
                .status(200)
                .send(ResponseHandler(200, "Task deleted successfully"));
        } catch (error) {
            return next(error);
        }
    },
};

export default taskControllers;
