import { config } from "@/shared/lib/config";
import { fetcher } from "@/shared/lib/fetcher";
import type {
  CreateShipmentDTO,
  ShipmentDTO,
  UpdateTrackingDTO,
} from "../../domain/contracts/shipment.contract";

export const shipmentsApi = {
  async getByOrder(orderId: string): Promise<ShipmentDTO> {
    return fetcher.get<ShipmentDTO>(
      `${config.apiUrl}/shipments/order/${orderId}`,
    );
  },

  async create(input: CreateShipmentDTO): Promise<ShipmentDTO> {
    return fetcher.post<ShipmentDTO>(`${config.apiUrl}/shipments`, input);
  },

  async updateTracking(id: string, input: UpdateTrackingDTO): Promise<ShipmentDTO> {
    return fetcher.patch<ShipmentDTO>(
      `${config.apiUrl}/shipments/${id}/tracking`,
      input,
    );
  },

  async markDelivered(id: string): Promise<ShipmentDTO> {
    return fetcher.patch<ShipmentDTO>(
      `${config.apiUrl}/shipments/${id}/delivered`,
      {},
    );
  },
};
