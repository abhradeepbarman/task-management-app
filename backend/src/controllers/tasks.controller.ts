import { Request, Response } from "express";
import Task from "../models/task.model";
import Project from "../models/project.model";
import TeamMember from "../models/team-member.model";
import createTaskSchema from "../validators/task/create-task.validator";
import updateTaskSchema from "../validators/task/update-task.validator";
import { taskStatus } from "../constants";

const taskControllers = {
    async getAllTasks(req: Request, res: Response): Promise<any> {
        try {
            const adminId = req.user?.id;
            const page = req.query.page
                ? parseInt(req.query.page as string)
                : null;
            const limit = req.query.limit
                ? parseInt(req.query.limit as string)
                : null;

            let tasks;
            let total;

            if (page && limit) {
                const skip = (page - 1) * limit;

                tasks = await Task.find({ adminId })
                    .skip(skip)
                    .limit(limit)
                    .populate("assignedMembers")
                    .populate("projectId");

                total = await Task.countDocuments({ adminId });

                return res.status(200).json({
                    success: true,
                    data: tasks,
                    pagination: {
                        total,
                        page,
                        limit,
                    },
                });
            } else {
                tasks = await Task.find({ adminId })
                    .populate("assignedMembers")
                    .populate("projectId");

                return res
                    .status(200)
                    .json({
                        success: true,
                        data: tasks,
                        pagination: {
                            total: tasks.length,
                            page: 1,
                            limit: tasks.length,
                        },
                    })
                    .json({
                        success: true,
                        data: tasks,
                    });
            }
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Something went wrong",
            });
        }
    },

    async createTask(req: Request, res: Response): Promise<any> {
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

            // Verify project exists and belongs to admin
            const project = await Project.findOne({
                _id: projectId,
                adminId,
            }).populate("teamMembers");
            if (!project) {
                return res.status(404).json({
                    success: false,
                    message: "Project not found",
                });
            }

            const projectTeamMemberIds = project.teamMembers.map((member) =>
                member._id.toString()
            );

            // verify if all team memebers are related to the project
            assignedMembers.forEach((memberId) => {
                if (!projectTeamMemberIds.includes(memberId)) {
                    return res.status(404).json({
                        success: false,
                        message: `Team member with ID ${memberId} not found`,
                    });
                }
            });

            const task = await Task.create({
                title,
                description,
                deadline,
                projectId,
                assignedMembers,
                status: status || taskStatus.PENDING,
                adminId
            });

            return res.status(201).json({ success: true, data: task });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                success: false,
                message: "Something went wrong",
            });
        }
    },

    async updateTask(req: Request, res: Response): Promise<any> {
        try {
            const taskId = req.params.id;
            const adminId = req.user?.id;
            const updates = updateTaskSchema.parse(req.body);

            const task = await Task.findById(taskId).populate("projectId");
            if (!task) {
                return res.status(404).json({
                    success: false,
                    message: "Task not found",
                });
            }

            // Verify project belongs to admin
            const project = await Project.findOne({
                _id: task.projectId,
                adminId,
            }).populate("teamMembers");
            if (!project) {
                return res.status(403).json({
                    success: false,
                    message: "You are not authorized to update this task",
                });
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
                        return res.status(404).json({
                            success: false,
                            message: `Team member with ID ${memberId} not found`,
                        });
                    }

                    if (!projectTeamMemberIds.includes(memberId)) {
                        return res.status(404).json({
                            success: false,
                            message: `Team member with ID ${memberId} not found`,
                        });
                    }
                }
            }

            const updatedTask = await Task.findByIdAndUpdate(taskId, updates, {
                new: true,
            })
                .populate("projectId")
                .populate("assignedMembers");

            return res.status(200).json({
                success: true,
                data: updatedTask,
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Something went wrong",
            });
        }
    },

    async deleteTask(req: Request, res: Response): Promise<any> {
        try {
            const taskId = req.params.id;
            const adminId = req.user?.id;

            const task = await Task.findById(taskId).populate("projectId");
            if (!task) {
                return res.status(404).json({
                    success: false,
                    message: "Task not found",
                });
            }

            // Verify project belongs to admin
            const project = await Project.findOne({
                _id: task.projectId,
                adminId,
            });
            if (!project) {
                return res.status(403).json({
                    success: false,
                    message: "You are not authorized to delete this task",
                });
            }

            await Task.findByIdAndDelete(taskId);
            return res.status(200).json({
                success: true,
                message: "Task deleted successfully",
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Something went wrong",
            });
        }
    },
};

export default taskControllers;
