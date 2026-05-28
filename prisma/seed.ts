import {
  ChargerStatus,
  ConnectorType,
  PowerLevel,
  ReservationStatus,
} from "@prisma/client";
import prisma from "../src/config/prisma";

async function main() {
    // clearing database before starting seeding
    await prisma.reservation.deleteMany();
    await prisma.charger.deleteMany();
    await prisma.station.deleteMany();
    await prisma.user.deleteMany();

    /**
    * 1st charging station
    */
    const station1 = await prisma.station.create({
        data: {
            name: "Dedham EV Charging Station",
            address: "840 Providence Hwy",
            city: "Dedham",
            state: "MA",
            zipCode: "02026",
            chargers: {
                create: [
                    {
                        connectorType: ConnectorType.NACS,
                        powerLevel: PowerLevel.DC_FAST,
                        status: ChargerStatus.AVAILABLE,
                    },
                    {
                        connectorType: ConnectorType.NACS,
                        powerLevel: PowerLevel.DC_FAST,
                        status: ChargerStatus.AVAILABLE,
                    },
                    {
                        connectorType: ConnectorType.CCS,
                        powerLevel: PowerLevel.LEVEL_2,
                        status: ChargerStatus.OUT_OF_SERVICE,
                    },
            ],
        },
      },
    });

    /**
    * 2nd charging station
    */
    const station2 = await prisma.station.create({
        data: {
            name: "Fenway EV Charging Station",
            address: "1341 Boylston St",
            city: "Boston",
            state: "MA",
            zipCode: "02215",
            chargers: {
                create: [
                    {
                        connectorType: ConnectorType.CCS,
                        powerLevel: PowerLevel.DC_FAST,
                        status: ChargerStatus.AVAILABLE,
                    },
                    {
                        connectorType: ConnectorType.NACS,
                        powerLevel: PowerLevel.LEVEL_2,
                        status: ChargerStatus.AVAILABLE,
                    },
                    {
                        connectorType: ConnectorType.NACS,
                        powerLevel: PowerLevel.DC_FAST,
                        status: ChargerStatus.AVAILABLE,
                    },
                ]
            }
        }
    });

    /**
    * 3rd charging station
    */
    const station3 = await prisma.station.create({
        data: {
            name: "Cambridge EV Charging Station",
            address: "100 Cambridgeside PI",
            city: "Cambridge",
            state: "MA",
            zipCode: "02141",
            chargers: {
                create: [
                    {
                        connectorType: ConnectorType.NACS,
                        powerLevel: PowerLevel.LEVEL_2,
                        status: ChargerStatus.AVAILABLE,
                    },
                    {
                        connectorType: ConnectorType.CCS,
                        powerLevel: PowerLevel.DC_FAST,
                        status: ChargerStatus.AVAILABLE,
                    },
                    {
                        connectorType: ConnectorType.NACS,
                        powerLevel: PowerLevel.DC_FAST,
                        status: ChargerStatus.AVAILABLE,
                    },
                ]
            }
        }
    });

    /**
    * 4th charging station
    */
    const station4 = await prisma.station.create({
        data: {
            name: "Somerville EV Charging Station",
            address: "779 McGrath Hwy",
            city: "Somerville",
            state: "MA",
            zipCode: "02145",
            chargers: {
                create: [
                    {
                        connectorType: ConnectorType.NACS,
                        powerLevel: PowerLevel.DC_FAST,
                        status: ChargerStatus.OUT_OF_SERVICE,
                    },
                    {
                        connectorType: ConnectorType.CCS,
                        powerLevel: PowerLevel.LEVEL_2,
                        status: ChargerStatus.OUT_OF_SERVICE,
                    },
                    {
                        connectorType: ConnectorType.NACS,
                        powerLevel: PowerLevel.LEVEL_2,
                        status: ChargerStatus.OUT_OF_SERVICE,
                    },
                ]
            }
        }
    });

    /**
    * 5th charging station
    */
    const station5 = await prisma.station.create({
        data: {
            name: "Revere EV Charging Station",
            address: "85 American Legion Hwy",
            city: "Revere",
            state: "MA",
            zipCode: "02151",
            chargers: {
                create: [
                    {
                        connectorType: ConnectorType.NACS,
                        powerLevel: PowerLevel.DC_FAST,
                        status: ChargerStatus.AVAILABLE,
                    },
                    {
                        connectorType: ConnectorType.CCS,
                        powerLevel: PowerLevel.LEVEL_2,
                        status: ChargerStatus.IN_USE,
                    },
                    {
                        connectorType: ConnectorType.NACS,
                        powerLevel: PowerLevel.LEVEL_2,
                        status: ChargerStatus.AVAILABLE,
                    },
                ]
            }
        }
    });

    /**
     * 1 admin
     */
    const admin = await prisma.user.create({
        data: {
            email: "admin@evsystem.com",
            passwordHash: "adminhash1",
            role: "ADMIN"
        }
    });

    /**
     * 1st customer
     */
    const customer1 = await prisma.user.create({
        data: {
            email: "milu@plushie.com",
            passwordHash: "miluhash1",
            role: "CUSTOMER"
        }
    });

    /**
     * 2nd customer
     */
    const customer2 = await prisma.user.create({
        data: {
            email: "ducko@plushie.com",
            passwordHash: "duckohash2",
            role: "CUSTOMER"
        }
    })

    /**
     * 3rd customer
     */
    const customer3 = await prisma.user.create({
        data: {
            email: "teddy@plushie.com",
            passwordHash: "teddyhash3",
            role: "CUSTOMER"
        }
    })

    /**
     * 4th customer
     */
    const customer4 = await prisma.user.create({
        data: {
            email: "cow@plushie.com",
            passwordHash: "cowhash4",
            role: "CUSTOMER"
        }
    })

    /**
     * 5th customer
     */
    const customer5 = await prisma.user.create({
        data: {
            email: "monkey@plushie.com",
            passwordHash: "monkeyhash5",
            role: "CUSTOMER"
        }
    })

    /**
     * 1st reservation at station1 for customer1 from 2 - 3PM
     */
    const charger1 = await prisma.charger.findFirst({
        where: {
            stationId: station1.id,
            status: ChargerStatus.AVAILABLE,
        },
    });
    if (charger1) {
        await prisma.reservation.create({
            data: {
                userId: customer1.id,
                stationId: station1.id,
                chargerId: charger1.id,
                startTime: new Date("2026-05-20T08:00:00.000Z"),
                endTime: new Date("2026-05-20T09:00:00.000Z"),
                status: ReservationStatus.CONFIRMED,
            },
        });
    }

    /**
     * 2nd reservation at station2 for customer2 from 8 - 9AM
     */
    const charger2 = await prisma.charger.findFirst({
        where: {
            stationId: station2.id,
            status: ChargerStatus.AVAILABLE,
        },
    });
    if (charger2) {
        await prisma.reservation.create({
            data: {
                userId: customer2.id,
                stationId: station2.id,
                chargerId: charger2.id,
                startTime: new Date("2026-05-20T18:00:00.000Z"),
                endTime: new Date("2026-05-20T19:00:00.000Z"),
                status: ReservationStatus.CONFIRMED,
            },
        });
    }
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });