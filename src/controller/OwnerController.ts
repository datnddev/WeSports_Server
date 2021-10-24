import { Request, Response } from "express";
import { Owner } from "../model/Owner";
import {
  validateAccountStatus,
  validatePhone,
  validateEmail,
} from "../util/validation";
import * as AddressFunc from "../controller/AddressController";

/**
 * Login in using username.
 * @route POST /login
 */
export const postLogin = async (req: Request, res: Response) => {
  let owner = await Owner.findOne({
    ownerUsername: req.body.ownerUsername,
    ownerPassword: req.body.ownerPassword,
  });
  return owner === null || undefined
    ? res.status(200).send("Sign in fail")
    : owner.accountStatus === 2
    ? res.status(200).send(owner)
    : owner.accountStatus === 1
    ? res.status(200).send("Account non verify email")
    : res.status(200).send("Account has been banned");
};

/**
 * Register account
 * @route POST /register
 */
export const postRegister = async (req: Request, res: Response) => {
  if (
    !validateAccountStatus(req.body.accountStatus) ||
    !validatePhone(req.body.ownerPhone) ||
    !validateEmail(req.body.ownerEmail)
  ) {
    return res.status(400).send("Validation fail");
  }
  let rs = await AddressFunc.addAddress(req.body.ownerAddress);
  if (rs === false) {
    return res.status(500).send("Add address error");
  }
  req.body.ownerAddress = rs._id;
  let owner = new Owner(req.body);
  try {
    let result = await owner.save();
    return res.status(200).send(result);
  } catch (error) {
    console.log(error);

    return res.status(500).send("Sign up fail");
  }
};

/**
 * Get all owner
 *
 * @param req
 * @param res
 * @returns
 */
export const getAllOwner = async (req: Request, res: Response) => {
  let owners = await Owner.find({});
  return res.status(200).send(owners);
};

/**
 * function update owner
 *
 * @param req
 * @param res
 * @returns
 */
export const postUpdateOwner = async (req: Request, res: Response) => {
  if (
    !validateAccountStatus(req.body.accountStatus) ||
    !validatePhone(req.body.ownerPhone)
  ) {
    return res.status(400).send("Validation fail");
  }
  try {
    let owner = await Owner.findByIdAndUpdate(req.body._id, req.body, {
      new: false,
    });
    if (owner === null || owner === undefined) {
      return res.status(200).send("1");
    }
    return res.status(200).send("0");
  } catch (error) {
    return res.sendStatus(500).send("Update error");
  }
};

/**
 * function delete owner
 *
 * @param req
 * @param res
 * @returns
 */
export const postDeleteOwner = (req: Request, res: Response) => {
  try {
    Owner.findByIdAndDelete(req.body._id, (err: Error, res: any) => {
      if (err) {
        return res.status(200).send("1");
      }
    });
    return res.status(200).send("0");
  } catch (error) {
    return res.sendStatus(500).send("Delete error");
  }
};

export const getOneOwner = async (req: Request, res: Response) => {
  let owner = await Owner.findById(req.body.id);
  // console.log(owner instanceof type.owner);
  if (owner === null) {
    return res.status(200).send("Owner not found");
  }
  return res.status(200).send(owner);
};
