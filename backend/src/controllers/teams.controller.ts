import { NextFunction, Request, Response } from "express";
import Project from "../models/project.model";
import Task from "../models/task.model";
import TeamMember from "../models/team-member.model";
import CustomErrorHandler from "../utils/CustomErrorHandler";
import ResponseHandler from "../utils/ResponseHandler";
import addTeamMemberSchema from "../validators/team-members/add-team-member.validator";
import editTeamMemberSchema from "../validators/team-members/edit-team-member.validator";

const teamMemberControllers = {
    async getAllTeamMembers(
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

            let teamMembers;
            let total;

            if (page && limit) {
                const skip = (page - 1) * limit;

                teamMembers = await TeamMember.find({ adminId })
                    .skip(skip)
                    .limit(limit);

                total = await TeamMember.countDocuments({ adminId });

                return res.status(200).send(
                    ResponseHandler(200, "success", {
                        data: teamMembers,
                        pagination: {
                            total,
                            page,
                            limit,
                            totalPages: Math.ceil(total / limit),
                        },
                    })
                );
            } else {
                // No pagination: fetch all
                teamMembers = await TeamMember.find({ adminId });

                return res.status(200).send(
                    ResponseHandler(200, "success", {
                        data: teamMembers,
                        pagination: null,
                    })
                );
            }
        } catch (error) {
            return next(error);
        }
    },

    async addTeamMember(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<any> {
        try {
            const { name, email, designation } = addTeamMemberSchema.parse(
                req.body
            );
            const adminId = req.user?.id;

            const isTeamMemberExists = await TeamMember.findOne({
                adminId,
                email,
            });
            if (isTeamMemberExists) {
                return res.send(
                    CustomErrorHandler.alreadyExist(
                        "Team member already exists"
                    )
                );
            }

            const teamMember = await TeamMember.create({
                adminId,
                name,
                email,
                designation,
            });
            return res
                .status(200)
                .send(ResponseHandler(200, "success", teamMember));
        } catch (error) {
            return next(error);
        }
    },

    async deleteTeamMember(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<any> {
        try {
            const teamMemberId = req.params.id;
            const adminId = req.user?.id;

            const teamMember = await TeamMember.findOne({
                _id: teamMemberId,
                adminId,
            });
            if (!teamMember) {
                return res.send(
                    CustomErrorHandler.notFound("Team member not found")
                );
            }

            if (!teamMember.adminId.equals(adminId)) {
                return res.send(CustomErrorHandler.unAuthorized());
            }

            await Project.updateMany(
                { adminId, teamMembers: teamMember._id },
                { $pull: { teamMembers: teamMember._id } }
            );

            await Task.updateMany(
                { adminId, assignedMembers: teamMember._id },
                { $pull: { assignedMembers: teamMember._id } }
            );

            await TeamMember.findByIdAndDelete(teamMemberId);

            return res
                .status(200)
                .send(ResponseHandler(200, "Team member deleted successfully"));
        } catch (error) {
            return next(error);
        }
    },

    async updateTeamMember(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<any> {
        try {
            const teamMemberId = req.params.id;
            const { name, email, designation } = editTeamMemberSchema.parse(
                req.body
            );
            const adminId = req.user?.id;

            const teamMember = await TeamMember.findOne({
                _id: teamMemberId,
                adminId,
            });
            if (!teamMember) {
                return res.send(
                    CustomErrorHandler.notFound("Team member not found")
                );
            }

            if (!teamMember.adminId.equals(adminId)) {
                return res.send(CustomErrorHandler.unAuthorized());
            }

            const updatedTeamMember = await TeamMember.findByIdAndUpdate(
                teamMemberId,
                {
                    name: name || teamMember.name,
                    email: email || teamMember.email,
                    designation: designation || teamMember.designation,
                },
                { new: true }
            );

            return res
                .status(200)
                .send(ResponseHandler(200, "success", updatedTeamMember));
        } catch (error) {
            return next(error);
        }
    },
};

export default teamMemberControllers;
