import mongoose, { Document, Schema } from 'mongoose';
import { constants } from '../config/constants';

// Geographical coordinates (longitude, latitude)
interface GeoLocation {
  type: string;
  coordinates: [number, number];
}

// Project boundary - for defining the project area
interface Boundary {
  type: string;
  coordinates: [number, number][];
}

export interface IProject extends Document {
  name: string;
  description: string;
  location: string;
  coordinates: GeoLocation;
  boundary?: Boundary;
  area: number;
  estimatedCarbonCapture: number;
  actualCarbonCapture?: number;
  startDate: Date;
  endDate: Date;
  projectType: string;
  status: string;
  owner: mongoose.Types.ObjectId;
  images?: string[]; 
  documents?: string[];
  topicId?: string;
  tokenId?: string;
  verificationHistory: {
    date: Date;
    status: string;
    notes?: string;
    verifier?: mongoose.Types.ObjectId;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    location: {
      type: String,
      required: true
    },
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        required: true
      }
    },
    boundary: {
      type: {
        type: String,
        enum: ['Polygon'],
        default: 'Polygon'
      },
      coordinates: {
        type: [[[Number]]],
        default: undefined
      }
    },
    area: {
      type: Number,
      required: true,
      min: 0
    },
    estimatedCarbonCapture: {
      type: Number,
      required: true,
      min: 0
    },
    actualCarbonCapture: {
      type: Number,
      min: 0,
      default: 0
    },
    carbonCredits: {
      type: Number,
      min: 0,
      default: 0
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    projectType: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: Object.values(constants.PROJECT_STATUS),
      default: constants.PROJECT_STATUS.DRAFT
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    images: [String],
    documents: [String],
    topicId: String, 
    tokenId: String,
    verificationHistory: [
      {
        date: {
          type: Date,
          default: Date.now
        },
        status: {
          type: String,
          enum: Object.values(constants.VERIFICATION_STATUS)
        },
        notes: String,
        verifier: {
          type: Schema.Types.ObjectId,
          ref: 'User'
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

// Create a geospatial index on the coordinates field
ProjectSchema.index({ coordinates: '2dsphere' });

export const Project = mongoose.model<IProject>('Project', ProjectSchema);