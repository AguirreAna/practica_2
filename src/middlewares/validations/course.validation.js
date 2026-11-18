// * ARCHIVO A COMPLETAR
// * Imports y courseIdValidation ya resueltos
import { body, param } from "express-validator";
import Course from "../../models/course.model.js";
import Topic from "../../models/topic.model.js";
import User from "../../models/user.model.js";

export const courseIdValidation = [
  param("id").isMongoId().withMessage("El ID del curso no es válido"),
];

export const createCourseValidation = [
  body("title") // TODO 1: de 3 a 100 caracteres y único (custom con una consulta a la base).
  .trim()
  .isLength({min:3,max:100})
  .withMessage("el titulo debe tener entre 3 y 100 caracteres ")
  .custom(async (value) => {
    const existingCourse = await Course.findOne({ title:value });
    if (existingCourse) {
        throw new Error("ya existe un curso con ese titulo");
    }
    return true;
  
  }),

  body("description") // TODO 2: de 10 a 500 caracteres.
  .trim()
  .isLength({min:3,max:500})
  .withMessage("la descripcion debe tener entre 10 y 500 caracteres"),

  body("level") // TODO 3: opcional; valores permitidos: ["beginner", "intermediate", "advanced"].
  .optional()
  .isIn(["beginner","intermediate","advanced"])
  .withMessage("el nivel debe ser beginner,intermediate o advanced"),

  body("price") // TODO 4: opcional; número mayor o igual a 0.
  .optional()
  .isFloat({min:0})
  .withMessage("el precio debe ser un numero mayor o igual a 0"),

  body("schedule.day")// TODO 5: valores permitidos: ["monday", "tuesday", "wednesday", "thursday", "friday"].
  .isIn(["monday","tuerday","wednesday","thurday","friday"])
  .withMessage("el dia debe ser monday , turday, wednesday,thusday,o friday"),


  body("schedule.startTime") // TODO 6: fecha válida (Date), obligatoria.
  .notEmpty()
  .withMessage("la hora de inicio es obligatoria")
  .isISO8601()
  .withMessage("la hora de inicia debe ser una fecha valida")
  .toDate(),

  body("schedule.endTime")// TODO 7: fecha válida (Date), obligatoria, y posterior a startTime (custom).
  .notEmpty()
  .withMessage("la hora de finalizacion es obligatoria")
  .isISO8601()
  .withMessage("la hora de finalizacion debe ser una fecha valida")
  .toDate()
  .custom((value,{req}) => {
    const startstime = new Date(req.body.schedule?.startTime);
    if (!isNan(startstime.getTime()) && value <= startstime) {
      throw new Error(
        "la hora de finalizacion debe ser posterior ala hora de inicio",
      );
    }
  }),

  body("teacher")// TODO 8: obligatorio; ID de MongoDB válido y el teacher debe existir y estar activo, es decir, con deletedAt null (custom).
  .optional()
  .isMongoId()
  .withMessage("el ID del profesor no es valido")
  .custom(async(value)=> {
    const teacher = await User.findOne({_id: value, deletedAt:null});
    if (!teacher) {
      throw new Error("el profesor no existe o no esta activo");
    }
    return true;
  }),

  body("topics") // TODO 9: opcional; array cuyos IDs existan en la base (custom).
  .optional()
  .isArray()
  .withMessage("los topicos deben enviarse como un array")
  .custom(async(topics) => {
    const uniqueIds = [...new Set(topics)];
    const count = await Topic.countDocuments({_id:{$in:uniqueIds}});
    if (count !== uniqueIds.length){
      throw new Error("uno o mas topicos no existen en la base de datos");
    }
    return true;
  }),
  
];

export const updateCourseValidation = [
  param("id"), // TODO 10: validar con isMongoId().


  body("title") // TODO 11: igual que en la creación, pero opcional. La unicidad debe excluir al propio curso.
  .optional()
  .trim()
  .isLength({min:3, max:100})
  .withMessage(" el titulo debe tener entre 3 y 100 caracteres")
  .custom(async(value, {req}) => {
    const existingCourse = await Course.findOne({
      title:value,
      _id:{$ne:req.params.id},
    });
    if (existingCourse) {
      throw new Error("ya existe otro curso con ese titulo");
    }
    return true;
  }),


  body("description")// TODO 12: igual que en la creación, pero opcional.
  .optional()
  .trim()
  .isLength()
  .withMessage("la descripcion debe tener entre 10 y 500 caracteres"),

  body("level")// TODO 13: igual que en la creación, pero opcional (valores permitidos: ["beginner", "intermediate", "advanced"]).
  .optional()
  .isIn(["beginner","intermediate","advanced"]),

  body("price") // TODO 14: igual que en la creación, pero opcional.
  .optional()
  .isFloat({min:0})
  .withMessage("el precio debe ser un numero mayor o igual a 0"),

  body("schedule.day") // TODO 15: igual que en la creación, pero opcional (valores permitidos: ["monday", "tuesday", "wednesday", "thursday", "friday"]).
  .optional()
  .isIn(["monday"])
  .withMessage("el dia debe ser monday"),
  body("schedule.startTime") // TODO 16: igual que en la creación, pero opcional.
  .optional()
  .isISO8601()
  .withMessage("la hora de inicio debe ser una fecha valida")
  .toDate(),

  body("schedule.endTime") // TODO 17: igual que en la creación, pero opcional (y posterior a startTime si ambos llegan).
  .optional()
  .isISO8601()
  .withMessage("la hora de finalizacion debe ser una fecha valida")
  .toDate()
  .custom((value,{req})=>{
    if (req.body.schedule?.startTime){
      const startstime = new Date(req.body.schedule.startTime);
      if(!isNaN(startstime.getTime()) && value <= startstime){
        throw new Error(" la hora de finalizacion debe ser posterior a la hora de inico");
      }
      return true;
    }
  }),

  body("teacher")// TODO 18: igual que en la creación, pero opcional.
  .optional()
  .isMongoId()
  .withMessage("el ID del profesor no es valido")
  .custom(async(value)=>{
    const teacher = await User.findOne({_id:value, deletedAt: null});
    if(!teacher){
      throw new Error("el profesor no existe o no esta activo");
    }
    return true;
  }),

  body("topics") // TODO 19: igual que en la creación, pero opcional.
  .optional()
  .isArray()
  .withMessage("los topicos deben enviarse como un array")
  .custom(async(topics) =>{
    const uniqueIds = [...new Set(topics)];
    const count = await topics.countDocuments({_id:{$in: uniqueIds}});
    if (count !== uniqueIds.length){
      throw new Error("uno o mas topicos no existen en la base de datos ");
    }
    return true;

  }),
];
