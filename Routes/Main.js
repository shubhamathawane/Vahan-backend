const { Router } = require("express");
const router = Router();
const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize(
  "postgres://postgres:root@localhost:5432/Vahan"
);

const models = [];

router.post("/entities", async (req, res) => {
  const { name, attributes } = req.body;
  const modelAttributes = {};
  try {
    attributes.forEach((attr) => {
      switch (attr.type.toUpperCase()) {
        case "STRING":
          modelAttributes[attr.name] = { type: DataTypes.STRING };
          break;
        case "NUMBER":
          modelAttributes[attr.name] = { type: DataTypes.BIGINT };
          break;
        case "DATE":
          modelAttributes[attr.name] = { type: DataTypes.DATE };
          break;
        default:
          return res
            .status(400)
            .json({ message: `Invalid type: ${attr.type}` });
      }
    });

    models[name] = sequelize.define(name, modelAttributes, {
      timestamps: true,
    });

    await models[name].sync();
    res.status(201).json({ message: `Entity ${name} created` });
    F;
  } catch (err) {
    console.log(err.message);
  }
});

router.get("/entities/:entity/attributes", async (req, res) => {
  const { entity } = req.params;
  try {
    if (models[entity]) {
      const attributes = models[entity].rawAttributes;
      const attributeList = Object.keys(attributes).map((attrName) => ({
        name: attrName,
        type: attributes[attrName].type.key,
      }));
      res.status(200).json(attributeList);
    } else {
      res.status(404).send(`Entity ${entity} not found.`);
    }
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
});

router.get("/entities", async (req, res) => {
  try {
    const entityNames = Object.keys(models);
    res.json(entityNames);
  } catch (error) {
    res.status(500).json({ message: "Error fetching entities", error });
  }
});

router.post("/:entity", async (req, res) => {
  const { entity } = req.params;
  const record = req.body;
  try {
    if (models[entity]) {
      const newRecord = await models[entity].create(record);
      res.status(201).json({ message: "Record Added Successfully", newRecord });
    } else {
      res.status(404).send(`Entity ${entity} not found.`);
    }
  } catch (error) {
    console.error("Error creating record:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
});

router.get("/:entity", async (req, res) => {
  const { entity } = req.params;
  try {
    if (models[entity]) {
      const records = await models[entity].findAll();
      res.status(200).json(records);
    } else {
      res.status(404).send(`Entity ${entity} not found!`);
    }
  } catch (error) {
    res.status(400).json(error);
  }
});

router.put("/:entity/:id", async (req, res) => {
  const { entity, id } = req.params;
  const updates = req.body;

  try {
    if (models[entity]) {
      const record = await models[entity].findByPk(id);

      if (record) {
        await record.update(updates);
        res.status(200).json(record);
      } else {
        res.status(404).json({ message: `Record with id ${id} not found!` });
      }
    } else {
      res.status(404).send(`Entity ${entity} not found!`);
    }
  } catch (err) {
    console.error(`Error updating record: `, err);
    res
      .status(500)
      .json({ message: `Internal server error`, error: err.message });
  }
});

router.delete("/:entity/:id", async (req, res) => {
  const { entity, id } = req.params;

  try {
    if (models[entity]) {
      const record = await models[entity].findByPk(id);
      if (record) {
        await record.destroy();
        res.status(200).send(`Record with ID ${id} deleted!`);
      } else {
        res.status(404).send(`Record with id ${id} not found!`);
      }
    } else {
      res.status(404).send(`Record with entity ${entity} not found!`);
    }
  } catch (err) {
    res
      .status(500)
      .json({ message: `Internal server error`, error: err.message });
  }
});

module.exports = router;
