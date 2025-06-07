import { Request, Response } from "express";
import TeamMember from "../models/team-member.model";
import addTeamMemberSchema from "../validators/team-members/add-team-member.validator";
import editTeamMemberSchema from "../validators/team-members/edit-team-member.validator";

const teamMemberControllers = {
    async getAllTeamMembers(req: Request, res: Response): Promise<any> {
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

                return res.status(200).json({
                    success: true,
                    data: teamMembers,
                    pagination: {
                        total,
                        page,
                        limit,
                        totalPages: Math.ceil(total / limit),
                    },
                });
            } else {
                // No pagination: fetch all
                teamMembers = await TeamMember.find({ adminId });

                return res.status(200).json({
                    success: true,
                    data: teamMembers,
                    pagination: null,
                });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Internal server error" });
        }
    },

    async addTeamMember(req: Request, res: Response): Promise<any> {
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
                return res.status(400).json({
                    success: false,
                    message: "Team member already exists",
                });
            }

            const teamMember = await TeamMember.create({
                adminId,
                name,
                email,
                designation,
            });
            return res.status(200).json({ success: true, data: teamMember });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                success: false,
                error: "Internal server error",
            });
        }
    },

    async deleteTeamMember(req: Request, res: Response): Promise<any> {
        try {
            const teamMemberId = req.params.id;
            const adminId = req.user?.id;

            const teamMember = await TeamMember.findOne({
                _id: teamMemberId,
                adminId,
            });
            if (!teamMember) {
                return res.status(404).json({
                    success: false,
                    message: "Team member not found",
                });
            }

            if (teamMember.adminId !== adminId) {
                return res.status(403).json({
                    success: false,
                    message:
                        "You are not authorized to delete this team member",
                });
            }

            await TeamMember.findByIdAndDelete(teamMemberId);
            return res.status(200).json({
                success: true,
                message: "Team member deleted successfully",
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: "Internal server error",
            });
        }
    },

    async updateTeamMember(req: Request, res: Response): Promise<any> {
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
                return res.status(404).json({
                    success: false,
                    message: "Team member not found",
                });
            }

            if (teamMember.adminId !== adminId) {
                return res.status(403).json({
                    success: false,
                    message:
                        "You are not authorized to update this team member",
                });
            }

            const updatedTeamMember = await TeamMember.findByIdAndUpdate(
                teamMemberId,
                { name, email, designation },
                { new: true }
            );

            return res.status(200).json({
                success: true,
                data: updatedTeamMember,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: "Internal server error",
            });
        }
    },
};

export default teamMemberControllers;
