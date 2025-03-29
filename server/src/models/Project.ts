import mongoose, { Document, Schema } from 'mongoose';
import { constants } from '../config/constants';

// Geographical coordinates (longitude, latitude)
interface GeoLocation {
  type: string;
  coordinates: [number, number]; // [longitude, latitude]
}

// Project boundary - for defining the project area
interface Boundary {
  type: string;
  coordinates: [number, number][]; // Array of coordinates forming a polygon
}

export interface IProject extends Document {
  name: string;
  description: string;
  location: string;
  coordinates: GeoLocation;
  boundary?: Boundary;
  area: number; // In hectares
  estimatedCarbonCapture: number; // In tons of CO2
  actualCarbonCapture?: number; // Updated after verification
  startDate: Date;
  endDate: Date;
  projectType: string; // e.g., reforestation, conservation, renewable energy
  status: string;
  owner: mongoose.Types.ObjectId; // User ID of the project owner
  images?: string[]; // Array of image URLs
  documents?: string[]; // Array of document URLs
  topicId?: string; // Hedera Consensus Service topic ID
  tokenId?: string; // Associated token ID (if tokens have been created)
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
        type: [Number], // [longitude, latitude]
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
        type: [[[Number]]], // Array of coordinates forming a polygon
        default: undefined
      }
    },
    area: {
      type: Number, // In hectares
      required: true,
      min: 0
    },
    estimatedCarbonCapture: {
      type: Number, // In tons of CO2
      required: true,
      min: 0
    },
    actualCarbonCapture: {
      type: Number, // Updated after verification
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
    images: [String], // Array of image URLs
    documents: [String], // Array of document URLs
    topicId: String, // Hedera Consensus Service topic ID
    tokenId: String, // Associated token ID
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