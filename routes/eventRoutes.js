import express from "express";
import {
  createEvent,
  getEvents,
  getEventById,
  updateEventStatus,
  uploadDocumentation,
  updateEvent,
  deleteEvent,
  updateCompletion,
} from "../controllers/eventController.js";
import { protect, hodOrPrincipal } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").post(protect, createEvent).get(protect, getEvents);

router
  .route("/:id")
  .get(protect, getEventById)
  .put(protect, updateEvent)
  .delete(protect, deleteEvent);

router.put("/:id/status", protect, hodOrPrincipal, updateEventStatus);
router.put("/:id/completion", protect, updateCompletion);
router.post("/:id/documents", protect, uploadDocumentation);

export default router;
