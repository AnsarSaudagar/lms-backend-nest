import { DIFFICULTY_LEVEL } from "src/common/constants/difficulty-level.constant";
import { Category } from "src/schemas/categories.schema";
import { Course } from "src/schemas/courses.schema";

export interface CourseDetailsDto {
    course: Course;
    categories: Category[];
    difficultyLevel: typeof DIFFICULTY_LEVEL;
}