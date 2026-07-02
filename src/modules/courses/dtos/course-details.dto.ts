import { DIFFICULTY_LEVEL } from "src/common/constants/difficulty-level.constant";
import { Category } from "src/modules/categories/schemas/category.schema";
import { Course } from "src/modules/courses/schemas/course.schema";

export interface CourseDetailsDto {
    course: Course;
    categories: Category[];
    difficultyLevel: typeof DIFFICULTY_LEVEL;
}